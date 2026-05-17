import { useEffect, useState } from "react";
import type { VisitorCall } from "@campainha/shared";
import { supabase } from "@/lib/supabase";
import { listCalls } from "@/services/calls";

export function useDoorbellRealtime(ownerId?: string) {
  const [activeCall, setActiveCall] = useState<VisitorCall | null>(null);

  useEffect(() => {
    if (!ownerId) return;

    const channel = supabase
      .channel(`visitor_calls:owner:${ownerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "visitor_calls",
          filter: `owner_id=eq.${ownerId}`,
        },
        async (payload) => {
          console.log("[Realtime] INSERT recebido:", payload.new.id);
          try {
            const calls = await listCalls();
            const enriched = calls.find((c) => c.id === payload.new.id);
            setActiveCall(enriched ?? (payload.new as VisitorCall));
          } catch {
            setActiveCall(payload.new as VisitorCall);
          }
        }
      )
      .subscribe((status, err) => {
        console.log("[Realtime] status:", status, err ?? "");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [ownerId]);

  return { activeCall, setActiveCall };
}
