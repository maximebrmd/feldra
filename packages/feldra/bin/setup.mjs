import { basename, resolve } from "node:path";

export const stackSummary =
  "Next.js + TypeScript · Drizzle · Stripe · Tailwind + shadcn · Ultracite\n2 apps: web (3000), app (3001) · shared packages · Turborepo + npm workspaces";

export const databases = {
  neon: {
    hint: "Serverless Postgres (default)",
    instructions:
      "Create a NEW Neon project. Copy its pooled connection string to DATABASE_URL and direct connection string to DATABASE_URL_UNPOOLED.",
    label: "Neon",
  },
  supabase: {
    hint: "Postgres only · independent authentication choice",
    instructions:
      "Create a NEW Supabase project. In Connect, copy the transaction pooler URL (port 6543) to DATABASE_URL. Set DATABASE_URL_UNPOOLED to the direct URL, or session pooler URL (port 5432) on IPv4-only networks. Disable the unused Data API in project settings. See docs/databases.md before migrating.",
    label: "Supabase",
  },
};

export const storageProviders = {
  blob: {
    hint: "Managed file storage · Vercel Blob",
    instructions:
      "Create a Vercel Blob store for this project and set its server-only BLOB_READ_WRITE_TOKEN in .env.local. Use a private store for user documents and a public store only for files that are safe to serve to anyone with the URL.",
    label: "Vercel Blob",
  },
  r2: {
    hint: "S3-compatible object storage · Cloudflare R2 (default)",
    instructions:
      "Create a bucket-scoped Cloudflare R2 Object Read & Write token and set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and (for public URLs) R2_PUBLIC_URL in .env.local. Keep the access key and secret server-only.",
    label: "Cloudflare R2",
  },
};

export const authentications = {
  appwrite: {
    hint: "Managed identity and auth emails · separate Appwrite project required",
    instructions:
      "Create a NEW Appwrite project. Enable email/password and require email verification. Create an API key with the Sessions write scope. Set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY in .env.local. Appwrite delivers verification and reset emails; Resend is not installed.",
    label: "Appwrite",
  },
  authjs: {
    hint: "Auth.js / NextAuth · GitHub OAuth · self-hosted session",
    instructions:
      "Create a NEW GitHub OAuth app. Set Homepage URL to APP_URL and callback URL to APP_URL/api/auth/callback/github. Set AUTH_GITHUB_ID and AUTH_GITHUB_SECRET in .env.local. A local AUTH_SECRET is generated; create a separate production secret. GitHub verifies email; Resend is not installed.",
    label: "Auth.js",
  },
  "better-auth": {
    hint: "Self-hosted identity · Resend auth emails (default)",
    instructions:
      "Generate a separate production BETTER_AUTH_SECRET. In Resend verify a sender domain and set RESEND_API_KEY and EMAIL_FROM.",
    label: "Better Auth",
  },
  clerk: {
    hint: "Managed identity and auth emails · separate Clerk account required",
    instructions:
      "Create a NEW Clerk application. Enable email/password and require email verification. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env.local. Configure /login and /signup and production domains. Clerk delivers verification and reset emails; Resend is not installed.",
    label: "Clerk",
  },
  supabase: {
    hint: "Supabase Auth · independent of --database · project URL and publishable key required",
    instructions:
      "Create a NEW Supabase project for Auth (independent of the database choice). Enable email/password and confirm email. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local. Add the application origin and /api/auth/callback to Auth redirect URLs. Supabase delivers verification and reset emails; Resend is not installed. Never add the service role key.",
    label: "Supabase Auth",
  },
};

const authenticationOrder = [
  "better-auth",
  "clerk",
  "authjs",
  "supabase",
  "appwrite",
];

export const docsFrameworks = {
  blume: {
    hint: "Astro documentation app (default)",
    instructions:
      "Run npm run docs:dev to preview the Blume docs app at http://localhost:4321, and npm run docs:build to produce static files in apps/docs/dist.",
    label: "Blume",
  },
  fumadocs: {
    hint: "Fumadocs Next.js documentation app",
    instructions:
      "Run npm run docs:dev to preview the Fumadocs app at http://localhost:4321, and npm run docs:build to produce a Next.js production build.",
    label: "Fumadocs",
  },
  mintlify: {
    hint: "Mintlify documentation app · local preview and validate",
    instructions:
      "Run npm run docs:dev to preview the Mintlify docs app at http://localhost:4321. Hosted Mintlify deployment is optional and not provisioned.",
    label: "Mintlify",
  },
};

export const featureFlags = {
  none: {
    hint: "No feature-flags package (default)",
    instructions: "No feature-flags provider was selected.",
    label: "No feature flags",
  },
  vercel: {
    hint: "Provider-agnostic Vercel Flags SDK package",
    instructions:
      "Set the generated FLAGS_SECRET separately for development, preview, and production. See docs/feature-flags.md.",
    label: "Vercel Flags SDK",
  },
};

function requireChoice(value, table, message) {
  if (value && !Object.hasOwn(table, value)) {
    throw new Error(message);
  }
  return value;
}

const storageAliases = {
  "cloudflare-r2": "r2",
  "vercel-blob": "blob",
};

function normalizeStorage(value) {
  return storageAliases[value] ?? value;
}

async function pickChoice(
  value,
  prompts,
  { choices, fallback, message, order }
) {
  if (value) {
    return value;
  }
  if (!prompts) {
    return fallback;
  }
  const keys = order ?? Object.keys(choices);
  return await prompts.select({
    initialValue: fallback,
    message,
    options: keys.map((option) => ({
      hint: choices[option].hint,
      label: choices[option].label,
      value: option,
    })),
  });
}

export async function collectSetup(options, prompts) {
  if (
    options.database &&
    options.preset &&
    options.database !== options.preset
  ) {
    throw new Error("--database and --preset must agree; prefer --database.");
  }
  let authentication = requireChoice(
    options.auth,
    authentications,
    `Choose ${authenticationOrder
      .map((value) => `--auth ${value}`)
      .join(" or ")}.`
  );
  let database = requireChoice(
    options.database || options.preset,
    databases,
    "Choose --database neon or --database supabase."
  );
  let storage = normalizeStorage(options.storage);
  storage = requireChoice(
    storage,
    storageProviders,
    "Choose --storage r2 or --storage blob."
  );
  let docs = requireChoice(
    options.docs,
    docsFrameworks,
    "Choose --docs blume, --docs mintlify, or --docs fumadocs."
  );
  let flags = requireChoice(
    options.flags,
    featureFlags,
    "Choose --flags none or --flags vercel."
  );
  let directory = options.directory;
  if (!directory && prompts) {
    directory = await prompts.text({
      defaultValue: "my-new-saas",
      message: "Project directory",
      placeholder: "my-new-saas",
    });
  }
  if (!directory?.trim()) {
    throw new Error(
      "Provide a destination in noninteractive mode: npx feldra@latest create my-new-saas --yes"
    );
  }
  const defaultName = basename(resolve(directory))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  const name =
    options.name ||
    (prompts
      ? await prompts.text({
          defaultValue: defaultName,
          message: "Package name",
          placeholder: defaultName,
        })
      : defaultName);
  if (
    !/^[a-z0-9][a-z0-9-]{0,213}$/u.test(name) ||
    ["node-modules", "favicon-ico"].includes(name)
  ) {
    throw new Error(
      "Use a lowercase npm name (letters, digits and hyphens; at most 214 characters)."
    );
  }
  database = await pickChoice(database, prompts, {
    choices: databases,
    fallback: "neon",
    message: "Which database do you want to use?",
  });
  storage = await pickChoice(storage, prompts, {
    choices: storageProviders,
    fallback: "r2",
    message: "Which storage provider do you want to use?",
    order: ["r2", "blob"],
  });
  authentication = await pickChoice(authentication, prompts, {
    choices: authentications,
    fallback: "better-auth",
    message: "Which authentication tool do you want to use?",
    order: authenticationOrder,
  });
  docs = await pickChoice(docs, prompts, {
    choices: docsFrameworks,
    fallback: "blume",
    message: "Which documentation framework do you want to use?",
    order: ["blume", "mintlify", "fumadocs"],
  });
  flags = await pickChoice(flags, prompts, {
    choices: featureFlags,
    fallback: "none",
    message: "Which feature-flags package do you want to use?",
    order: ["none", "vercel"],
  });
  if (
    prompts &&
    !(await prompts.confirm({
      initialValue: true,
      message: `Create ${name} with ${databases[database].label} + ${authentications[authentication].label} + ${storageProviders[storage].label} + ${docsFrameworks[docs].label} + ${featureFlags[flags].label}?`,
    }))
  ) {
    throw new Error("Canceled. No project files were created.");
  }
  return {
    auth: authentication,
    directory,
    docs,
    flags,
    name,
    preset: database,
    storage,
  };
}
