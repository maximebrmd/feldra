import "server-only";

function appwriteEndpoint(value: string) {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password &&
      (url.protocol === "https:" ||
        ["localhost", "127.0.0.1"].includes(url.hostname))
    );
  } catch {
    return false;
  }
}

export function appwriteConfigured() {
  return (
    appwriteEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "") &&
    Boolean(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim()) &&
    Boolean(process.env.APPWRITE_API_KEY?.trim())
  );
}

export function appwriteEnv() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim() ?? "";
  const apiKey = process.env.APPWRITE_API_KEY?.trim() ?? "";
  if (!(appwriteEndpoint(endpoint) && projectId && apiKey)) {
    throw new Error(
      "Provider configuration required: set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY. See .env.example and docs/setup.md."
    );
  }
  return { apiKey, endpoint, projectId };
}
