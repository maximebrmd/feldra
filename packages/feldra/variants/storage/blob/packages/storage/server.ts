import "server-only";

export type { HandleUploadBody } from "@vercel/blob/client";
// biome-ignore lint/performance/noBarrelFile: The generated package intentionally mirrors the provider server API.
export { handleUpload } from "@vercel/blob/client";
