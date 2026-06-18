"use client";

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getClientId } from '@/app/client/actions';
import toast from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


type NotificationContextType = {
  requestPermission: () => Promise<void>;
};

export const NotificationContext = createContext<NotificationContextType>({
  requestPermission: async () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [granted, setGranted] = useState(false);

  const requestPermission = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported on this browser.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error('Permission denied for notifications.');
      return;
    }
    setGranted(true);

    const registration = await navigator.serviceWorker.register('/sw.js');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });

    const clientId = await getClientId();
    if (!clientId) return;

    await supabase.from('push_subscriptions').upsert({
      client_id: clientId,
      endpoint: subscription.endpoint,
      p256dh: subscription.toJSON().keys?.p256dh,
      auth: subscription.toJSON().keys?.auth,
    });
    toast.success('Push notifications enabled.');
  };

  // Realtime fallback for browsers without push (e.g., iOS Safari)
  useEffect(() => {
    const initRealtime = async () => {
      const clientId = await getClientId();
      if (!clientId) return;
      const channel = supabase
        .channel('public:reminders')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'reminders',
            filter: `client_id=eq.${clientId}`,
          },
          (payload) => {
            toast('⏰ You have a progress‑entry reminder!');
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    };
    initRealtime();
  }, []);

  return (
    <NotificationContext.Provider value={{ requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
