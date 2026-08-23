"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getInsforge, isBackendConfigured } from "@/lib/insforge/client";

export type Role = "customer" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  username: string | null;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
};

export type AuthUser = { id: string; email?: string; name?: string } & Record<
  string,
  unknown
>;

const USERNAME_DOMAIN = "qualityglass.in";

/** "@OWNE_AJMAL69 " → "owne_ajmal69" */
export const normalizeUsername = (raw: string) =>
  raw
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

export const usernameToEmail = (u: string) =>
  `${normalizeUsername(u)}@${USERNAME_DOMAIN}`;

/** Login field accepts "@username" or a real email. */
export const identifierToEmail = (id: string) => {
  const t = id.trim().toLowerCase();
  // a leading "@" is a handle (e.g. "@OWNEAJMAL69"), never an email —
  // emails never start with "@" while usernames here conventionally do
  if (t.startsWith("@")) return usernameToEmail(t);
  return t.includes("@") ? t : usernameToEmail(t);
};

export function errMsg(e: unknown): string {
  if (!e) return "Something went wrong. Please try again.";
  if (typeof e === "string") return e;
  const m = (e as { message?: string }).message || "";
  if (m.toLowerCase().includes("duplicate")) return "That username is already taken.";
  return m || "Something went wrong. Please try again.";
}

type AuthCtxValue = {
  configured: boolean;
  loading: boolean;
  user: AuthUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (args: {
    username: string;
    email?: string;
    password: string;
    name: string;
  }) => Promise<{ needsVerification: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<AuthCtxValue>({
  configured: false,
  loading: true,
  user: null,
  profile: null,
  isAdmin: false,
  signIn: async () => {},
  signUp: async () => ({ needsVerification: false }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

const first = (d: unknown): Record<string, unknown> | undefined =>
  Array.isArray(d)
    ? (d[0] as Record<string, unknown>)
    : (d as Record<string, unknown> | undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isBackendConfigured;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  /** Load (or lazily create) the profile row for a user. */
  const fetchProfile = useCallback(async (u: AuthUser): Promise<Profile | null> => {
    const fallback: Profile = {
      id: u.id,
      full_name: (u.name as string) || "",
      username: null,
      phone: null,
      role: "customer",
      avatar_url: null,
    };
    try {
      const client = getInsforge();
      const { data } = await client.database
        .from("profiles")
        .select("*")
        .eq("id", u.id);
      const row = first(data) as Profile | undefined;
      if (row?.id) return row;

      // profile missing (edge) — create it; RLS allows own insert
      await client.database
        .from("profiles")
        .insert([{ id: u.id, full_name: fallback.full_name }]);
      const { data: again } = await client.database
        .from("profiles")
        .select("*")
        .eq("id", u.id);
      return (first(again) as Profile | undefined) ?? fallback;
    } catch {
      return fallback;
    }
  }, []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const res = (await getInsforge().auth.getCurrentUser()) as {
          data?: { user?: AuthUser } | AuthUser;
        };
        const u =
          ((res?.data as { user?: AuthUser })?.user ??
            (res?.data as AuthUser | undefined)) || null;
        if (alive && u?.id) {
          setUser(u);
          setProfile(await fetchProfile(u));
        }
      } catch {
        /* not signed in */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [configured, fetchProfile]);

  const signIn = useCallback(
    async (identifier: string, password: string) => {
      const { data, error } = await getInsforge().auth.signInWithPassword({
        email: identifierToEmail(identifier),
        password,
      });
      if (error) throw new Error(errMsg(error));
      const d = data as { user?: AuthUser } | AuthUser | undefined;
      const u =
        ((d as { user?: AuthUser })?.user ?? (d as AuthUser | undefined)) || null;
      if (!u?.id) throw new Error("Login failed. Please try again.");
      setUser(u);
      setProfile(await fetchProfile(u));
    },
    [fetchProfile]
  );

  const signUp = useCallback(
    async ({
      username,
      email,
      password,
      name,
    }: {
      username: string;
      email?: string;
      password: string;
      name: string;
    }) => {
      const uname = normalizeUsername(username);
      if (!uname || uname.length < 3) throw new Error("Username must be at least 3 characters.");
      const client = getInsforge();
      const authEmail = email?.trim()
        ? email.trim().toLowerCase()
        : usernameToEmail(uname);

      const { data, error } = await client.auth.signUp({
        email: authEmail,
        password,
        name,
      });
      if (error) throw new Error(errMsg(error));

      const d = data as
        | ({ user?: AuthUser } & {
            accessToken?: string;
            session?: unknown;
            token?: string;
          })
        | AuthUser
        | undefined;
      const u = ((d as { user?: AuthUser })?.user ?? (d as AuthUser | undefined)) || null;
      const hasSession = Boolean(
        (d as { accessToken?: string; session?: unknown; token?: string })
          ?.accessToken ??
          (d as { session?: unknown; token?: string })?.session ??
          (d as { token?: string })?.token
      );

      if (u?.id && hasSession) {
        // always make sure a profile row exists, then attach the @username
        await fetchProfile(u);
        try {
          const { error: pErr } = await client.database
            .from("profiles")
            .update({ username: uname, full_name: name })
            .eq("id", u.id);
          if (pErr) throw new Error(errMsg(pErr));
        } catch (e) {
          throw e instanceof Error ? e : new Error(errMsg(e));
        }
        setUser(u);
        setProfile(await fetchProfile(u));
        return { needsVerification: false };
      }
      return { needsVerification: true };
    },
    [fetchProfile]
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await getInsforge().auth.signInWithOAuth({
      provider: "google",
      redirectTo: `${window.location.origin}/`,
    } as never);
    if (error) throw new Error(errMsg(error));
  }, []);

  const signOut = useCallback(async () => {
    try {
      await getInsforge().auth.signOut();
    } catch {
      /* ignore */
    }
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      configured,
      loading,
      user,
      profile,
      isAdmin: profile?.role === "admin",
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [configured, loading, user, profile, signIn, signUp, signInWithGoogle, signOut]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
