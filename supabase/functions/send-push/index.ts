import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

serve(async (req) => {
  const payload = await req.json();
  const record = payload.record;
  if (!record?.owner_id) return new Response("ignored", { status: 200 });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: tokens } = await supabase
    .from("device_tokens")
    .select("expo_push_token")
    .eq("owner_id", record.owner_id)
    .eq("ativo", true);

  const messages = (tokens ?? []).map((token) => ({
    to: token.expo_push_token,
    sound: "default",
    title: "Campainha Digital",
    body: "Alguém chamou na sua campainha.",
    data: { callId: record.id }
  }));

  if (!messages.length) return new Response("no tokens", { status: 200 });

  const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(Deno.env.get("EXPO_ACCESS_TOKEN") ? { Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}` } : {})
    },
    body: JSON.stringify(messages)
  });

  return new Response(await expoResponse.text(), { status: expoResponse.status });
});
