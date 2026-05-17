import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export const NavCtx = createContext<(path: string) => void>(() => {});
export const UserCtx = createContext<User | null>(null);

export const useNav = () => useContext(NavCtx);
export const useUser = () => useContext(UserCtx);
