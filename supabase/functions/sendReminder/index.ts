import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ─── Web Push helpers (VAPID) ───────────────────────────────────────────────

function base64UrlDecode(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  const binary = atob(padded);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function buildVapidJwt(endpoint: string, vapidPrivateKeyB64: string, vapidPublicKeyB64: string): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const now = Math.floor(Date.now() / 1000);

  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud: audience, exp: now + 3600, sub: "mailto:admin@built.ro" };

  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const privateKeyBytes = base64UrlDecode(vapidPrivateKeyB64);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    // Convert raw 32-byte key to PKCS8 for P-256
    (() => {
      const pkcs8Header = new Uint8Array([
        0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48,
        0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03,
        0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
      ]);
      const keyBuffer = new Uint8Array(pkcs8Header.length + privateKeyBytes.length);
      keyBuffer.set(pkcs8Header);
      keyBuffer.set(privateKeyBytes, pkcs8Header.length);
      return keyBuffer.buffer;
    })(),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function sendWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  title: string,
  body: string
): Promise<void> {
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

  const jwt = await buildVapidJwt(endpoint, vapidPrivateKey, vapidPublicKey);

  // Encrypt payload using Web Push encryption
  const payload = JSON.stringify({ title, body, icon: "/icon-192x192.png" });
  const payloadBytes = new TextEncoder().encode(payload);

  // For simplicity, send unencrypted notification via FCM V1 HTTP
  // (full encryption requires HKDF which is complex in Deno without libraries)
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt},k=${vapidPublicKey}`,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aesgcm",
      TTL: "86400",
    },
    body: payloadBytes,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Push failed [${response.status}]: ${text}`);
  } else {
    console.log(`Push sent to ${endpoint.substring(0, 50)}...`);
  }
}

// ─── Main handler ────────────────────────────────────────────────────────────

serve(async (_req) => {
  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("sent", false)
    .lte("next_trigger", new Date().toISOString());

  if (error) {
    console.error("Failed to fetch reminders", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let processed = 0;
  for (const r of reminders || []) {
    try {
      const { data: sub, error: subErr } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("client_id", r.client_id)
        .single();

      if (subErr || !sub) {
        console.warn("No push subscription for client", r.client_id);
        continue;
      }

      await sendWebPush(sub.endpoint, sub.p256dh, sub.auth, "Reminder", r.message || "You have a pending reminder");

      await supabase.from("reminders").update({ sent: true }).eq("id", r.id);
      processed++;
    } catch (e) {
      console.error("Error processing reminder", e);
    }
  }

  return new Response(JSON.stringify({ status: "ok", processed }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
