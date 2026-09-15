import "server-only";

export function storageEnv() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Vercel Blob configuration required: BLOB_READ_WRITE_TOKEN. See .env.example and STORAGE.md."
    );
  }
  return { BLOB_READ_WRITE_TOKEN: token };
}
