"use client";

import { useEffect } from "react";
import { createBrowserSupabase } from "../lib/supabase";

export const useRealtimePresence = () => {
  const supabase = createBrowserSupabase();

  useEffect(() => {
    // Gerar um ID único temporário para esta sessão de navegação
    const sessionId = Math.random().toString(36).substring(7);
    
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    channel
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track entry
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);
};

export default function RealtimePresenceTracker() {
  useRealtimePresence();
  return null;
}
