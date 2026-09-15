"use client";

export interface R2UploadOptions {
  contentType?: string;
  uploadUrl: string;
  url?: string;
}

export interface R2UploadResult {
  contentType: string;
  pathname: string;
  url?: string;
}

export async function upload(
  pathname: string,
  body: BodyInit,
  options: R2UploadOptions
): Promise<R2UploadResult> {
  const response = await fetch(options.uploadUrl, {
    body,
    headers: options.contentType
      ? { "Content-Type": options.contentType }
      : undefined,
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error(`R2 upload failed (${response.status}).`);
  }
  return {
    contentType: options.contentType ?? "application/octet-stream",
    pathname,
    ...(options.url ? { url: options.url } : {}),
  };
}
