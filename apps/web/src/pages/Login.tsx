import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNav } from "../ctx";

type Mode = "in" | "up";

export function Login() {
  const go = useNav();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setLoading(true);

    const { error: err } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });

    setLoading(false);
    if (err) { setError(err.message); return; }
    go("/app");
  }

  return (
    <div className="page">
      <div className="panel">
        <img src="/logo.png" alt="Campainha Digital" className="logo" />

        <h1 className="panel-title">{mode === "in" ? "Entrar" : "Criar conta"}</h1>
        <p className="panel-sub">
          {mode === "in"
            ? "Acesse suas campainhas e histórico de chamadas."
            : "Crie sua conta para cadastrar suas campainhas."}
        </p>

        <form onSubmit={submit} className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="input"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            className="input"
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="panel-switch">
          {mode === "in" ? "Não tem conta?" : "Já tem conta?"}{" "}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setMode(mode === "in" ? "up" : "in"); setError(""); }}
          >
            {mode === "in" ? "Criar conta" : "Entrar"}
          </a>
        </p>
      </div>
    </div>
  );
}
