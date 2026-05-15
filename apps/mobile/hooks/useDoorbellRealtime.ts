import { useEffect, useState } from "react";
import type { VisitorCall } from "@campainha/shared";
import { supabase } from "@/lib/supabase";
import { listCalls } from "@/services/calls";

export function useDoorbellRealtime(ownerId?: string) {
  const [activeCall, setActiveCall] = useState<VisitorCall | null>(null);

  useEffect(() => {
    if (!ownerId) return;

    const channel = supabase
      .channel(`visitor_calls:${ownerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "visitor_calls",
          filter: `owner_id=eq.${ownerId}`
        },
        async (payload) => {
          const calls = await listCalls();
          const enriched = calls.find((call) => call.id === payload.new.id);
          setActiveCall((enriched ?? (payload.new as VisitorCall)));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [ownerId]);

  return { activeCall, setActiveCall };
}
