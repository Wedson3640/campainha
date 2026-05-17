import { useEffect, useRef, useState } from "react";
import type { VisitorCall } from "@campainha/shared";
import { supabase } from "../lib/supabase";

type Props = {
  call: VisitorCall | null;
  onClose: () => void;
};

export function CallNotification({ call, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!call) { setPhotoUrl(null); return; }

    const audio = new Audio("/doorbell.wav");
    audio.loop = true;
    audio.volume = 1;
    audioRef.current = audio;
    audio.play().catch(() => undefined);

    if (call.visitor_photo_url && supabase) {
      supabase.storage
        .from("visitor-photos")
        .createSignedUrl(call.visitor_photo_url, 300)
        .then(({ data }) => setPhotoUrl(data?.signedUrl ?? null))
        .catch(() => undefined);
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, [call?.id]);

  if (!call) return null;

  const local = call.doorbells?.local ?? call.doorbells?.nome ?? "Entrada";

  function dismiss() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPhotoUrl(null);
    onClose();
  }

  return (
    <div className="call-overlay" role="alertdialog" aria-modal="true">
      <div className="call-card">
        <img src="/logo.png" alt="Campainha Digital" className="logo" style={{ marginBottom: 24 }} />

        <div className="call-ring-icon">🔔</div>

        <h2 className="call-title">Alguém está na porta!</h2>
        <p className="call-local">{local}</p>

        {photoUrl ? (
          <div className="call-photo-wrap">
            <img src={photoUrl} alt="Foto do visitante" className="call-photo" />
          </div>
        ) : call.visitor_photo_url ? (
          <div className="call-photo-wrap call-photo-loading">
            <span className="loader" />
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>Carregando foto…</p>
          </div>
        ) : (
          <div className="call-photo-wrap call-photo-empty">
            <span style={{ fontSize: 56 }}>👤</span>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>Sem foto</p>
          </div>
        )}

        {call.message && (
          <div className="call-message">
            <p>"{call.message}"</p>
          </div>
        )}

        <p className="call-time">
          {new Date(call.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>

        <button onClick={dismiss} className="call-btn-dismiss">✓ Ciente — fechar aviso</button>
      </div>
    </div>
  );
}
