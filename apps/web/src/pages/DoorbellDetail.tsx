import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Doorbell } from "@campainha/shared";
import { buildPublicDoorbellUrl } from "@campainha/shared";
import { supabase } from "../lib/supabase";
import { useNav } from "../ctx";

export function DoorbellDetail({ id }: { id: string }) {
  const go = useNav();
  const [doorbell, setDoorbell] = useState<Doorbell | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { void load(); }, [id]);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("doorbells").select("*").eq("id", id).single();
    if (data) {
      setDoorbell(data as Doorbell);
      const url = buildPublicDoorbellUrl(window.location.origin, data.qr_token);
      const dataUrl = await QRCode.toDataURL(url, {
        width: 260,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    }
    setLoading(false);
  }

  async function copyLink() {
    if (!doorbell) return;
    const url = buildPublicDoorbellUrl(window.location.origin, doorbell.qr_token);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function downloadQr() {
    if (!qrDataUrl || !doorbell) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `campainha-${doorbell.nome.replace(/\s+/g, "-")}.png`;
    a.click();
  }

  async function deactivate() {
    if (!supabase || !doorbell) return;
    if (!confirm("Excluir esta campainha? O QR Code parará de funcionar.")) return;
    await supabase.from("doorbells").update({ ativo: false }).eq("id", doorbell.id);
    go("/app");
  }

  if (loading) return <div className="page"><span className="loader" /></div>;
  if (!doorbell) return <div className="page"><p>Campainha não encontrada.</p></div>;

  const url = buildPublicDoorbellUrl(window.location.origin, doorbell.qr_token);

  return (
    <div className="app-layout">
      <header className="app-header">
        <button className="btn-ghost" onClick={() => go("/app")}>← Voltar</button>
        <img src="/logo.png" alt="Campainha Digital" className="app-logo" />
        <button className="btn-ghost btn-danger" onClick={deactivate}>Excluir</button>
      </header>

      <main className="app-main">
        <h1 className="app-title">{doorbell.nome}</h1>
        {doorbell.local && <p className="detail-local">📍 {doorbell.local}</p>}

        <div className="qr-card">
          {qrDataUrl
            ? <img src={qrDataUrl} alt="QR Code" className="qr-img" />
            : <span className="loader" />}
          <p className="qr-hint">
            Imprima e fixe na entrada — o visitante escaneia e chama você automaticamente.
          </p>
        </div>

        <div className="detail-actions">
          <button onClick={copyLink}>{copied ? "✓ Link copiado!" : "Copiar link"}</button>
          <button className="secondary" onClick={downloadQr}>Baixar QR Code</button>
        </div>

        <div className="url-box">
          <code>{url}</code>
        </div>
      </main>
    </div>
  );
}
