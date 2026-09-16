import "server-only";
import { z } from "zod";

const required = z.string().min(1);
const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url({ protocol: /^https?$/u }).optional()
);

const schema = z.object({
  R2_ACCESS_KEY_ID: required,
  R2_ACCOUNT_ID: required,
  R2_BUCKET_NAME: required,
  R2_ENDPOINT: optionalUrl,
  R2_PUBLIC_URL: optionalUrl,
  R2_SECRET_ACCESS_KEY: required,
});

export function storageEnv() {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Cloudflare R2 configuration required: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}. See .env.example and STORAGE.md.`
    );
  }
  return result.data;
}
