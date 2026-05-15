import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { PublicDoorbell } from "@campainha/shared";
import { sanitizeVisitorMessage } from "@campainha/shared";
import { supabase, supabaseConfigError } from "./lib/supabase";
import "./styles.css";

type Status = "loading" | "ready" | "invalid" | "config-error" | "sending" | "sent" | "error";

function getTokenFromPath() {
  const [, route, token] = window.location.pathname.split("/");
  return route === "campainha" ? token : "";
}

async function captureVisitorPhoto(video: HTMLVideoElement, token: string) {
  if (!supabase) throw new Error(supabaseConfigError);

  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
  video.srcObject = stream;
  await video.play();

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 720;
  canvas.height = video.videoHeight || 960;
  canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
  stream.getTracks().forEach((track) => track.stop());

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((nextBlob) => (nextBlob ? resolve(nextBlob) : reject(new Error("Falha ao capturar foto."))), "image/jpeg", 0.82)
  );

  if (blob.size > 2_000_000) throw new Error("A imagem excede o limite de 2MB.");

  const path = `${token}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("visitor-photos").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: false
  });
  if (error) throw error;
  return path;
}

function App() {
  const token = useMemo(getTokenFromPath, []);
  const [doorbell, setDoorbell] = useState<PublicDoorbell | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setStatus("config-error");
        return;
      }

      if (!token) {
        setStatus("invalid");
        return;
      }
      const { data, error: rpcError } = await supabase.rpc("get_public_doorbell", { token_value: token });
      if (rpcError || !data?.[0]?.ativo) {
        setStatus("invalid");
        return;
      }
      setDoorbell(data[0]);
      setStatus("ready");
    }
    void load();
  }, [token]);

  async function ring(withCamera: boolean) {
    setError("");
    setStatus("sending");
    try {
      if (!supabase) throw new Error(supabaseConfigError);

      const photoPath = withCamera && videoRef.current ? await captureVisitorPhoto(videoRef.current, token) : null;
      const { error: callError } = await supabase.rpc("create_visitor_call", {
        token_value: token,
        photo_path: photoPath,
        visitor_message: sanitizeVisitorMessage(message),
        visitor_agent: navigator.userAgent
      });
      if (callError) throw callError;
      setStatus("sent");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Não foi possível tocar a campainha.");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return <main className="page"><section className="panel"><p>Validando campainha...</p></section></main>;
  }

  if (status === "invalid") {
    return <main className="page"><section className="panel"><h1>Campainha indisponível</h1><p>Este QR Code não está ativo ou foi revogado.</p></section></main>;
  }

  if (status === "config-error") {
    return <main className="page"><section className="panel"><h1>Configuracao ausente</h1><p>{supabaseConfigError}</p></section></main>;
  }

  if (status === "sent") {
    return (
      <main className="page">
        <section className="panel success">
          <h1>Campainha enviada</h1>
          <p>Aguarde atendimento.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="panel">
        <p className="eyebrow">Campainha Digital</p>
        <h1>Você está chamando: {doorbell?.local || doorbell?.nome}</h1>
        <p className="privacy">
          A câmera é opcional. Se você permitir, uma imagem será enviada apenas para o morador responsável por esta campainha.
        </p>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={240}
          placeholder="Mensagem opcional"
        />
        {error ? <p className="error">{error}</p> : null}
        <div className="actions">
          <button disabled={status === "sending"} onClick={() => ring(false)}>Chamar sem câmera</button>
          <button disabled={status === "sending"} className="secondary" onClick={() => ring(true)}>Permitir câmera e chamar</button>
        </div>
        <video ref={videoRef} muted playsInline className="hidden-video" />
        <p className="note">O QR Code não expõe dados pessoais do morador.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
