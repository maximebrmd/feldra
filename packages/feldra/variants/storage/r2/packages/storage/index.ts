import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  type GetObjectCommandInput,
  HeadObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storageEnv } from "./keys";

const imageKey = /\.(?:jpe?g|png|gif|webp|svg)$/iu;
const jsonKey = /\.json$/iu;
const leadingSlash = /^\/+/u;
const trailingSlash = /\/+$/u;
const periodSegment = /^(?:\.|\.\.)$/u;
const urlLikeKey = /:\/\//u;
const absoluteUrl =
  /^[A-Za-z][A-Za-z\d+.-]*:\/\/[^/?#]*(\/[^?#]*)?(?:[?#]|$)/u;

export interface PutBlobResult {
  contentDisposition: string | undefined;
  contentType: string;
  downloadUrl: string;
  etag: string | undefined;
  pathname: string;
  url: string;
}

export interface StoragePutOptions {
  access?: "private" | "public";
  cacheControl?: string;
  contentDisposition?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

type StorageBody = NonNullable<PutObjectCommandInput["Body"]>;

let client: S3Client | undefined;

function getClient() {
  if (client) {
    return client;
  }
  const env = storageEnv();
  client = new S3Client({
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    endpoint:
      env.R2_ENDPOINT ??
      `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: "auto",
  });
  return client;
}

function keyFromPathname(pathname: string) {
  const key = pathname.replace(leadingSlash, "");
  if (!key) {
    throw new Error("Storage object key cannot be empty.");
  }
  if (urlLikeKey.test(key)) {
    throw new Error("Storage object keys cannot contain URL-like values.");
  }
  if (key.split("/").some((segment) => periodSegment.test(segment))) {
    throw new Error(
      'Storage object keys cannot contain "." or ".." path segments.'
    );
  }
  return key;
}

function publicUrlPrefix(base: URL) {
  return base.pathname.replace(trailingSlash, "") || "/";
}

function rawUrlPathname(input: string) {
  const match = absoluteUrl.exec(input);
  if (!match) {
    throw new Error("R2 object URL is invalid.");
  }
  return match[1] ?? "/";
}

function keyFromInput(
  input: string,
  env: ReturnType<typeof storageEnv>
) {
  if (!input.includes("://")) {
    return keyFromPathname(input);
  }
  const rawPathname = rawUrlPathname(input);
  const url = new URL(input);
  if (!env.R2_PUBLIC_URL) {
    throw new Error(
      "R2 object URLs must use R2_PUBLIC_URL. Pass an object key when deleting a private object."
    );
  }
  const publicBase = new URL(env.R2_PUBLIC_URL);
  if (url.origin !== publicBase.origin) {
    throw new Error(
      "R2 object URLs must use R2_PUBLIC_URL. Pass an object key when deleting a private object."
    );
  }
  const prefix = publicUrlPrefix(publicBase);
  let relativePath: string | undefined;
  if (prefix === "/") {
    relativePath = rawPathname.replace(leadingSlash, "");
  } else if (rawPathname === prefix) {
    relativePath = "";
  } else if (rawPathname.startsWith(prefix + "/")) {
    relativePath = rawPathname.slice(prefix.length + 1);
  }
  if (relativePath === undefined) {
    throw new Error(
      "R2 object URLs must use the configured R2_PUBLIC_URL path."
    );
  }
  return keyFromPathname(
    relativePath
      .split("/")
      .map((part) => decodeURIComponent(part))
      .join("/")
  );
}

function publicUrl(base: string | undefined, key: string) {
  if (!base) {
    throw new Error(
      "R2_PUBLIC_URL is required for put(). Configure a public bucket URL or custom domain, or use getUploadUrl()/getDownloadUrl() for private objects."
    );
  }
  const url = new URL(base);
  const prefix = publicUrlPrefix(url);
  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  url.pathname = (prefix === "/" ? "" : prefix) + "/" + encodedKey;
  return url.toString();
}

function contentTypeFor(key: string, contentType: string | undefined) {
  if (contentType) {
    return contentType;
  }
  if (jsonKey.test(key)) {
    return "application/json";
  }
  if (imageKey.test(key)) {
    return "image/*";
  }
  return "application/octet-stream";
}

export async function put(
  pathname: string,
  body: StorageBody,
  options: StoragePutOptions = {}
): Promise<PutBlobResult> {
  if (options.access === "private") {
    throw new Error(
      "Cloudflare R2 put() supports public URL results only. Use the S3 commands or getDownloadUrl() for private objects."
    );
  }
  const env = storageEnv();
  const key = keyFromPathname(pathname);
  const contentType = contentTypeFor(key, options.contentType);
  const result = await getClient().send(
    new PutObjectCommand({
      Body: body,
      Bucket: env.R2_BUCKET_NAME,
      CacheControl: options.cacheControl,
      ContentDisposition: options.contentDisposition,
      ContentType: contentType,
      Key: key,
      Metadata: options.metadata,
    })
  );
  const url = publicUrl(env.R2_PUBLIC_URL, key);
  return {
    contentDisposition: options.contentDisposition,
    contentType,
    downloadUrl: url,
    etag: result.ETag,
    pathname: key,
    url,
  };
}

export async function del(input: string) {
  const env = storageEnv();
  const key = keyFromInput(input, env);
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export async function get(
  pathname: string,
  options: Omit<GetObjectCommandInput, "Bucket" | "Key"> = {}
) {
  const env = storageEnv();
  const key = keyFromPathname(pathname);
  return await getClient().send(
    new GetObjectCommand({
      ...options,
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export async function head(pathname: string) {
  const env = storageEnv();
  const key = keyFromPathname(pathname);
  return await getClient().send(
    new HeadObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export async function list(
  options: Omit<ListObjectsV2CommandInput, "Bucket"> = {}
) {
  const env = storageEnv();
  return await getClient().send(
    new ListObjectsV2Command({ ...options, Bucket: env.R2_BUCKET_NAME })
  );
}

export async function getUploadUrl(
  pathname: string,
  contentType?: string,
  expiresIn = 900
) {
  const env = storageEnv();
  const key = keyFromPathname(pathname);
  return await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      ContentType: contentType,
      Key: key,
    }),
    { expiresIn }
  );
}

export async function getDownloadUrl(pathname: string, expiresIn = 900) {
  const env = storageEnv();
  const key = keyFromPathname(pathname);
  return await getSignedUrl(
    getClient(),
    new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn }
  );
}

export const storage = {
  del,
  get,
  getDownloadUrl,
  getUploadUrl,
  head,
  list,
  put,
};

// biome-ignore lint/performance/noBarrelFile: The generated package intentionally exposes the S3 primitives needed for private-object workflows.
export {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
