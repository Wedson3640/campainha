import React, { useEffect, useRef } from "react";
import type { VisitorCall } from "@campainha/shared";

type Props = {
  call: VisitorCall | null;
  onClose: () => void;
};

export function CallNotification({ call, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!call) return;

    const audio = new Audio("/doorbell.wav");
    audio.loop = true;
    audio.volume = 1;
    audioRef.current = audio;
    audio.play().catch(() => undefined);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, [call]);

  if (!call) return null;

  const local = call.doorbells?.local ?? call.doorbells?.nome ?? "Entrada";

  function dismiss() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onClose();
  }

  return (
    <div className="call-overlay" role="alertdialog" aria-modal="true">
      <div className="call-card">
        <img src="/logo.png" alt="Campainha Digital" className="logo" style={{ marginBottom: 24 }} />

        <div className="call-ring-icon">🔔</div>

        <h2 className="call-title">Alguém está na porta!</h2>
        <p className="call-local">{local}</p>

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
