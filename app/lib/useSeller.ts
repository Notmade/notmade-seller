"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, clearSession, getToken, type Seller } from "./seller-api";

type State =
  | { status: "loading" }
  | { status: "ready"; seller: Seller | null } // null = signed-up email with no seller row yet
  | { status: "error"; message: string };

/** Loads the signed-in seller from GET /seller/me; sends the user to /login if the session is invalid. */
export function useSeller() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  const signOut = useCallback(() => {
    clearSession();
    router.replace("/login");
  }, [router]);

  const reload = useCallback(async () => {
    if (!getToken()) { signOut(); return; }
    try {
      const { seller } = await api.me();
      setState({ status: "ready", seller });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) { signOut(); return; }
      if (err instanceof ApiError && err.status === 403) { setState({ status: "ready", seller: null }); return; }
      setState({ status: "error", message: err instanceof Error ? err.message : "Could not load your account" });
    }
  }, [signOut]);

  useEffect(() => { void reload(); }, [reload]);

  return { state, reload, signOut };
}
