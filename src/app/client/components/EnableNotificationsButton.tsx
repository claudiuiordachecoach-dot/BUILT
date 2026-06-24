"use client";

import { useState, useEffect } from "react";
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

type State = "checking" | "active" | "inactive" | "denied" | "unsupported" | "working";

export function EnableNotificationsButton({ clientId }: { clientId: number }) {
  const [state, setState] = useState<State>("checking");
  const [err, setErr] = useState("");

  // Detectează starea REALĂ la montare → persistă între vizite (nu mai apare butonul dacă e deja activ).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (!cancelled) setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setState("denied");
        return;
      }
      try {
        const reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((r) => setTimeout(() => r(null), 3000)),
        ]);
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (!cancelled) setState(sub ? "active" : "inactive");
      } catch {
        if (!cancelled) setState("inactive");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const enable = async () => {
    setErr("");
    setState("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "inactive");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Reutilizează abonamentul existent dacă e deja pe acest device (evită duplicate).
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });
      }

      const subJson = sub.toJSON();
      const { error } = await supabase.from("push_subscriptions").upsert({
        client_id: clientId,
        endpoint: sub.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      });
      if (error) {
        setErr(error.message);
        setState("inactive");
        return;
      }
      setState("active");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "necunoscută");
      setState("inactive");
    }
  };

  if (state === "checking") {
    return <span className="text-zinc-600 text-sm">Se verifică…</span>;
  }

  if (state === "active") {
    return (
      <span className="inline-flex items-center gap-2 text-green-400 text-sm font-medium whitespace-nowrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Notificările sunt active
      </span>
    );
  }

  if (state === "unsupported") {
    return <span className="text-zinc-500 text-xs leading-relaxed text-right max-w-[180px]">Browserul acesta nu suportă notificări. Pe iPhone, adaugă întâi aplicația pe ecranul principal.</span>;
  }

  if (state === "denied") {
    return <span className="text-orange-400 text-xs leading-relaxed text-right max-w-[180px]">Notificările sunt blocate din setările telefonului. Activează-le din Setări → notificări pentru BUILT.</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={enable}
        disabled={state === "working"}
        className="press flex items-center gap-2 px-4 py-2 bg-built-red text-white text-sm font-medium rounded-lg hover:bg-built-red/90 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {state === "working" ? "Se activează…" : "🔔 Activează Notificările"}
      </button>
      {err && <span className="text-red-400 text-xs max-w-[180px] text-right">{err}</span>}
    </div>
  );
}
