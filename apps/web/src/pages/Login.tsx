import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNav } from "../ctx";

type Mode = "in" | "up";

export function Login() {
  const go = useNav();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
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

        <h1 className="panel-title">
          {mode === "in" ? "Acesse o sistema" : "Criar conta"}
        </h1>
        <p className="panel-sub">
          {mode === "in"
            ? "Utilize suas credenciais para continuar."
            : "Preencha os dados para criar sua conta."}
        </p>

        <form onSubmit={submit} className="form">
          <div className="field-group">
            <label className="field-label">E-mail cadastrado</label>
            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input input-with-icon"
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Senha</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                className="input input-with-icon input-with-toggle"
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary-lg">
            {loading ? "Aguarde…" : mode === "in" ? "➔  Entrar" : "➔  Criar conta"}
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

        <p className="panel-version">Versão 1.0</p>
      </div>
    </div>
  );
}
