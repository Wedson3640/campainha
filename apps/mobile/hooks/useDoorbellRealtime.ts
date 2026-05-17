import { useEffect, useRef, useState } from "react";
import type { VisitorCall } from "@campainha/shared";
import { supabase } from "@/lib/supabase";
import { listCalls } from "@/services/calls";

export function useDoorbellRealtime(ownerId?: string) {
  const [activeCall, setActiveCall] = useState<VisitorCall | null>(null);
  // keep a ref so the async callback always reads the latest value
  const ownerIdRef = useRef(ownerId);
  useEffect(() => { ownerIdRef.current = ownerId; }, [ownerId]);

  useEffect(() => {
    if (!ownerId) return;

    const channel = supabase
      .channel("visitor_calls_inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visitor_calls" },
        async (payload) => {
          // filter client-side — avoids server-side filter limitations
          if (payload.new.owner_id !== ownerIdRef.current) return;
          console.log("[Realtime] chamada recebida:", payload.new.id);
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
