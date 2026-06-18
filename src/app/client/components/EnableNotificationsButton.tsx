"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function EnableNotificationsButton({ clientId }: { clientId: number }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleClick = async () => {
    setLoading(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setMsg("Browserul nu suportă notificări push.");
        setStatus("error");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMsg("Permisiune refuzată.");
        setStatus("error");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const subJson = subscription.toJSON();
      const { error } = await supabase.from("push_subscriptions").upsert({
        client_id: clientId,
        endpoint: subscription.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      });

      if (error) {
        setMsg("Eroare la salvare: " + error.message);
        setStatus("error");
      } else {
        setMsg("Notificările sunt activate! ✅");
        setStatus("done");
      }
    } catch (e: any) {
      setMsg("Eroare: " + (e?.message || "necunoscută"));
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "done") {
    return <span className="text-green-400 text-sm font-medium">{msg}</span>;
  }

  if (status === "error") {
    return <span className="text-red-400 text-sm font-medium">{msg}</span>;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? "Se activează..." : "🔔 Activează Notificările"}
    </button>
  );
}
