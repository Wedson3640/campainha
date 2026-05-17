import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigError } from "./lib/supabase";
import { NavCtx, UserCtx } from "./ctx";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { DoorbellDetail } from "./pages/DoorbellDetail";
import { Visitor } from "./pages/Visitor";
import "./styles.css";

type Page =
  | { tag: "login" }
  | { tag: "dashboard" }
  | { tag: "doorbell"; id: string }
  | { tag: "visitor"; token: string };

function parsePage(path: string): Page {
  const [, a, b] = path.split("/");
  if (a === "campainha" && b) return { tag: "visitor", token: decodeURIComponent(b) };
  if (a === "app" && b) return { tag: "doorbell", id: b };
  if (a === "app") return { tag: "dashboard" };
  return { tag: "login" };
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  function go(to: string) {
    window.history.pushState({}, "", to);
    setPath(to);
  }

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const page = parsePage(path);
  const isVisitor = page.tag === "visitor";

  if (!ready && !isVisitor) {
    return <div className="page"><span className="loader" /></div>;
  }

  if (supabaseConfigError && !isVisitor) {
    return (
      <div className="page">
        <div className="panel">
          <img src="/logo.png" alt="Campainha Digital" className="logo" />
          <h1>Configuração ausente</h1>
          <p>{supabaseConfigError}</p>
        </div>
      </div>
    );
  }

  if (ready) {
    if (user && page.tag === "login") { go("/app"); return null; }
    if (!user && !isVisitor && page.tag !== "login") { go("/"); return null; }
  }

  return (
    <NavCtx.Provider value={go}>
      <UserCtx.Provider value={user}>
        {page.tag === "visitor" ? <Visitor token={page.token} /> :
         page.tag === "login"   ? <Login /> :
         page.tag === "dashboard" ? <Dashboard /> :
         page.tag === "doorbell"  ? <DoorbellDetail id={page.id} /> :
         null}
      </UserCtx.Provider>
    </NavCtx.Provider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
