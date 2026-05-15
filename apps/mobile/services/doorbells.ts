import * as Crypto from "expo-crypto";
import type { Doorbell } from "@campainha/shared";
import { supabase } from "@/lib/supabase";

function createQrToken() {
  const bytes = Crypto.getRandomBytes(32);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function ensureDefaultResidence(ownerId: string) {
  const { data: existing, error: existingError } = await supabase
    .from("residences")
    .select("id")
    .eq("owner_id", ownerId)
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("residences")
    .insert({ owner_id: ownerId, nome: "Minha residência", endereco_apelido: "Casa" })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function listDoorbells() {
  const { data, error } = await supabase
    .from("doorbells")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Doorbell[];
}

export async function createDoorbell(ownerId: string, nome: string, local: string) {
  const residenceId = await ensureDefaultResidence(ownerId);
  const { data, error } = await supabase
    .from("doorbells")
    .insert({
      owner_id: ownerId,
      residence_id: residenceId,
      nome,
      local,
      qr_token: createQrToken()
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Doorbell;
}

export async function rotateDoorbellToken(doorbellId: string) {
  const { data, error } = await supabase
    .from("doorbells")
    .update({ qr_token: createQrToken(), updated_at: new Date().toISOString() })
    .eq("id", doorbellId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Doorbell;
}
