import "server-only";

const publishableKey =
  /^(?:eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|sb_publishable_[A-Za-z0-9_-]+)$/u;

export function supabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function supabaseConfigured() {
  const url = supabaseUrl();
  const key = supabasePublishableKey();
  try {
    const parsed = new URL(url);
    const local =
      parsed.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(parsed.hostname);
    const hosted = parsed.protocol === "https:";
    if (
      !(local || hosted) ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    ) {
      return false;
    }
  } catch {
    return false;
  }
  return publishableKey.test(key);
}
