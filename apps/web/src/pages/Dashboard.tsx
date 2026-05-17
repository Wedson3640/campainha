import React, { useEffect, useState } from "react";
import type { Doorbell } from "@campainha/shared";
import { supabase } from "../lib/supabase";
import { useNav, useUser } from "../ctx";

function createQrToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function ensureResidence(ownerId: string) {
  if (!supabase) throw new Error("Supabase não configurado");
  const { data } = await supabase.from("residences").select("id").eq("owner_id", ownerId).limit(1).maybeSingle();
  if (data) return data.id as string;
  const { data: created, error } = await supabase
    .from("residences")
    .insert({ owner_id: ownerId, nome: "Minha residência", endereco_apelido: "Casa" })
    .select("id")
    .single();
  if (error) throw error;
  return created.id as string;
}

export function Dashboard() {
  const go = useNav();
  const user = useUser();
  const [doorbells, setDoorbells] = useState<Doorbell[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [local, setLocal] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { void load(); }, []);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("doorbells").select("*").eq("ativo", true).order("created_at", { ascending: false });
    setDoorbells((data as Doorbell[]) ?? []);
    setLoading(false);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !user) return;
    setCreating(true);
    setFormError("");
    try {
      const residenceId = await ensureResidence(user.id);
      const { error } = await supabase.from("doorbells").insert({
        owner_id: user.id,
        residence_id: residenceId,
        nome: nome.trim(),
        local: local.trim() || null,
        qr_token: createQrToken(),
      });
      if (error) throw error;
      setShowForm(false);
      setNome("");
      setLocal("");
      await load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar campainha.");
    } finally {
      setCreating(false);
    }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    go("/");
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <img src="/logo.png" alt="Campainha Digital" className="app-logo" />
        <button className="btn-ghost" onClick={signOut}>Sair</button>
      </header>

      <main className="app-main">
        <div className="app-top">
          <h1 className="app-title">Minhas Campainhas</h1>
          <button onClick={() => setShowForm(true)}>+ Nova</button>
        </div>

        {loading ? (
          <div className="center-block"><span className="loader" /></div>
        ) : doorbells.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p>Nenhuma campainha cadastrada ainda.</p>
            <button onClick={() => setShowForm(true)}>Criar primeira campainha</button>
          </div>
        ) : (
          <div className="doorbell-list">
            {doorbells.map((d) => (
              <button key={d.id} className="doorbell-card" onClick={() => go(`/app/${d.id}`)}>
                <div className="doorbell-icon-wrap">🔔</div>
                <div className="doorbell-info">
                  <span className="doorbell-nome">{d.nome}</span>
                  {d.local && <span className="doorbell-local">{d.local}</span>}
                </div>
                <span className="chevron">›</span>
              </button>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nova campainha</h2>
            <form onSubmit={create} className="form">
              <input
                placeholder="Nome (ex: Casa, Apt 42)"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="input"
              />
              <input
                placeholder="Local (ex: Portão da frente)"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="input"
              />
              {formError && <p className="error">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" disabled={creating}>{creating ? "Criando…" : "Criar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
