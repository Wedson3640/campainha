export type CallStatus = "pending" | "viewed" | "ended" | "expired" | "rejected";

export type Doorbell = {
  id: string;
  residence_id: string;
  owner_id: string;
  nome: string;
  local: string | null;
  qr_token: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicDoorbell = Pick<Doorbell, "id" | "nome" | "local" | "ativo">;

export type VisitorCall = {
  id: string;
  doorbell_id: string;
  owner_id: string;
  status: CallStatus;
  visitor_photo_url: string | null;
  visitor_user_agent: string | null;
  visitor_ip_hash: string | null;
  message: string | null;
  created_at: string;
  viewed_at: string | null;
  ended_at: string | null;
  doorbells?: Pick<Doorbell, "nome" | "local"> | null;
};

export type AppSettings = {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  silentMode: boolean;
};

export const CALL_STATUSES: CallStatus[] = ["pending", "viewed", "ended", "expired", "rejected"];

export function buildPublicDoorbellUrl(publicBaseUrl: string, qrToken: string) {
  return `${publicBaseUrl.replace(/\/$/, "")}/campainha/${encodeURIComponent(qrToken)}`;
}

export function sanitizeVisitorMessage(value: string) {
  return value.replace(/[<>]/g, "").trim().slice(0, 240);
}
