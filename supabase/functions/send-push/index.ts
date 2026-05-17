import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

serve(async (req) => {
  const payload = await req.json();
  const record = payload.record;
  if (!record?.owner_id) return new Response("ignored", { status: 200 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Busca nome/local da campainha para personalizar o push
  const { data: doorbell } = await supabase
    .from("doorbells")
    .select("nome, local")
    .eq("id", record.doorbell_id)
    .single();

  const local = doorbell?.local ?? doorbell?.nome ?? "Entrada";
  const body = record.message
    ? `"${record.message}" — ${local}`
    : `Alguém chamou em: ${local}`;

  // Busca todos os tokens ativos do morador
  const { data: tokens } = await supabase
    .from("device_tokens")
    .select("expo_push_token")
    .eq("owner_id", record.owner_id)
    .eq("ativo", true);

  if (!tokens?.length) return new Response("no tokens", { status: 200 });

  const messages = tokens.map((t) => ({
    to: t.expo_push_token,
    sound: "default",
    title: "🔔 Campainha Digital",
    body,
    data: { callId: record.id },
    channelId: "doorbell",
    priority: "high",
  }));

  const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      ...(Deno.env.get("EXPO_ACCESS_TOKEN")
        ? { Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}` }
        : {}),
    },
    body: JSON.stringify(messages),
  });

  return new Response(await expoRes.text(), { status: expoRes.status });
});
