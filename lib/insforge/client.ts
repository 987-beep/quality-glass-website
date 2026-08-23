import { createClient } from "@insforge/sdk";

/**
 * Browser client — talks ONLY to this site's own /api routes.
 * The InsForge project key lives exclusively on the server (INSFORGE_API_KEY)
 * and is attached by our allow-listed relay; the browser never holds any
 * project credential. Logged-in users carry their own session JWT, and
 * InsForge enforces RLS (plus DB write-guard triggers) on that identity.
 */

export const isBackendConfigured = true;

export type InsforgeClient = ReturnType<typeof createClient>;

let _client: InsforgeClient | null = null;

/** Lazily-created client (client components only — needs window.location). */
export function getInsforge(): InsforgeClient {
  if (typeof window === "undefined") {
    throw new Error("InsForge client is browser-only. Use server relays on the server.");
  }
  if (!_client) {
    _client = createClient({
      baseUrl: window.location.origin,
      anonKey: "proxied-on-server",
    });
  }
  return _client;
}
