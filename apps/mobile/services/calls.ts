import type { VisitorCall } from "@campainha/shared";
import { supabase } from "@/lib/supabase";

export async function listCalls() {
  const { data, error } = await supabase
    .from("visitor_calls")
    .select("*, doorbells(nome, local)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as VisitorCall[];
}

export async function markCallViewed(callId: string) {
  const { error } = await supabase
    .from("visitor_calls")
    .update({ status: "viewed", viewed_at: new Date().toISOString() })
    .eq("id", callId)
    .eq("status", "pending");
  if (error) throw error;
}

export async function endCall(callId: string) {
  const { error } = await supabase
    .from("visitor_calls")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", callId);
  if (error) throw error;
}

export async function createSignedVisitorPhotoUrl(path: string) {
  const { data, error } = await supabase.storage.from("visitor-photos").createSignedUrl(path, 60 * 5);
  if (error) throw error;
  return data.signedUrl;
}
