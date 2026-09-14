import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const betterAuthEnv = ["BETTER_AUTH_SECRET", "RESEND_API_KEY", "EMAIL_FROM"];
const AUTHJS_VERSION = "5.0.0-beta.32";

async function overlayVariant(destination, variant, { lockfile = true } = {}) {
  await cp(variant, destination, {
    filter: (path) => lockfile || !path.endsWith("package-lock.json"),
    recursive: true,
  });
}

async function removePaths(destination, paths) {
  for (const path of paths) {
    await rm(join(destination, path), { force: true, recursive: true });
  }
}

async function json(destination, path, update) {
  const file = join(destination, path);
  const data = JSON.parse(await readFile(file, "utf8"));
  update(data);
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function dropBetterAuthTooling(destination, envKeys, integrationTest) {
  await json(destination, "package.json", (pkg) => {
    delete pkg.devDependencies["better-auth"];
    delete pkg.scripts["test:browser"];
    pkg.scripts["test:integration"] = pkg.scripts["test:integration"].replace(
      "node ",
      "node --experimental-test-module-mocks "
    );
  });
  await json(destination, "turbo.json", (config) => {
    config.globalEnv = config.globalEnv.filter(
      (key) => !betterAuthEnv.includes(key)
    );
    config.globalEnv.push(...envKeys);
  });
  const envFile = join(destination, "packages/config/env.ts");
  let env = await readFile(envFile, "utf8");
  env = env
    .replace(/export function authEnv\(\) \{[\s\S]*?\n\}/u, "")
    .replace(/export function emailEnv\(\) \{[\s\S]*?\n\}/u, "");
  await writeFile(envFile, env);
  const testScript = join(destination, "scripts/test-database.mjs");
  await writeFile(
    testScript,
    (await readFile(testScript, "utf8"))
      .replace(
        '"--conditions=react-server"',
        '"--experimental-test-module-mocks", "--conditions=react-server"'
      )
      .replace('"tests/integration/flows.test.ts"', `"${integrationTest}"`)
  );
}

async function prependReadme(destination, banner) {
  const readme = join(destination, "README.md");
  await writeFile(readme, `${banner}\n\n${await readFile(readme, "utf8")}`);
}

async function replaceEnvExample(destination, extra) {
  const example = join(destination, ".env.example");
  await writeFile(
    example,
    (await readFile(example, "utf8")).replace(
      /^(BETTER_AUTH_SECRET|RESEND_API_KEY|EMAIL_FROM)=.*\n/gmu,
      ""
    ) + extra
  );
}

const defaultIdentityPaths = [
  "packages/auth/client.ts",
  "packages/email",
  "tests/integration/flows.test.ts",
  "scripts/test-browser.mjs",
  "tests/browser-seed.ts",
];

export async function applyClerk(
  destination,
  variant,
  { lockfile = true } = {}
) {
  await overlayVariant(destination, variant, { lockfile });
  await removePaths(destination, [
    ...defaultIdentityPaths,
    "apps/app/src/components/auth-form.tsx",
    "apps/app/src/app/api/auth",
    "apps/app/src/app/login/page.tsx",
    "apps/app/src/app/signup/page.tsx",
  ]);
  await json(destination, "packages/auth/package.json", (pkg) => {
    pkg.exports = {
      "./config": "./config.ts",
      "./identity": "./identity.ts",
      "./server": "./server.ts",
    };
    pkg.dependencies = {
      "@clerk/nextjs": "7.9.2",
      "@repo/database": "*",
      "server-only": "0.0.1",
    };
  });
  await json(destination, "apps/app/package.json", (pkg) => {
    pkg.dependencies["@clerk/nextjs"] = "7.9.2";
  });
  await dropBetterAuthTooling(
    destination,
    ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
    "tests/integration/clerk-data.test.ts"
  );
  await prependReadme(
    destination,
    "> Generated authentication: **Clerk**. Start with [Clerk setup](docs/authentication.md). Better Auth/Resend sections describe the alternative default, not this generated project."
  );
  await replaceEnvExample(
    destination,
    "\n# Separate Clerk application per derived project. Clerk delivers auth emails.\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\nCLERK_SECRET_KEY=\n"
  );
  const settings = join(
    destination,
    "apps/app/src/app/dashboard/settings/page.tsx"
  );
  await writeFile(
    settings,
    (await readFile(settings, "utf8"))
      .replace('href="/forgot-password"', 'href="/account"')
      .replace("Reset your password", "Manage sign-in and security")
  );
}

export async function applyAppwrite(
  destination,
  variant,
  { lockfile = true } = {}
) {
  await overlayVariant(destination, variant, { lockfile });
  await removePaths(destination, [
    ...defaultIdentityPaths,
    "apps/app/src/app/api/auth/[...all]",
  ]);
  await json(destination, "packages/auth/package.json", (pkg) => {
    pkg.exports = {
      "./config": "./config.ts",
      "./identity": "./identity.ts",
      "./server": "./server.ts",
      "./sync": "./sync.ts",
    };
    pkg.dependencies = {
      "@repo/config": "*",
      "@repo/database": "*",
      "node-appwrite": "29.0.0",
      "server-only": "0.0.1",
    };
  });
  await dropBetterAuthTooling(
    destination,
    [
      "APPWRITE_API_KEY",
      "NEXT_PUBLIC_APPWRITE_ENDPOINT",
      "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
    ],
    "tests/integration/appwrite-data.test.ts"
  );
  await prependReadme(
    destination,
    "> Generated authentication: **Appwrite**. Start with [Appwrite setup](docs/authentication.md). Better Auth/Resend sections describe the alternative default, not this generated project."
  );
  await replaceEnvExample(
    destination,
    "\n# Separate Appwrite project per derived SaaS. Appwrite delivers auth emails.\nNEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1\nNEXT_PUBLIC_APPWRITE_PROJECT_ID=\nAPPWRITE_API_KEY=\n"
  );
}

export async function applyAuthjs(
  destination,
  variant,
  { lockfile = true } = {}
) {
  await overlayVariant(destination, variant, { lockfile });
  await removePaths(destination, [
    ...defaultIdentityPaths,
    "apps/app/src/components/auth-form.tsx",
    "apps/app/src/app/api/auth/[...all]",
  ]);
  await json(destination, "packages/auth/package.json", (pkg) => {
    pkg.exports = {
      "./auth": "./auth.ts",
      "./config": "./config.ts",
      "./identity": "./identity.ts",
      "./server": "./server.ts",
    };
    pkg.dependencies = {
      "@repo/database": "*",
      "next-auth": AUTHJS_VERSION,
      "server-only": "0.0.1",
    };
  });
  await json(destination, "apps/app/package.json", (pkg) => {
    pkg.dependencies["next-auth"] = AUTHJS_VERSION;
  });
  await dropBetterAuthTooling(
    destination,
    ["AUTH_SECRET", "AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"],
    "tests/integration/authjs-data.test.ts"
  );
  await prependReadme(
    destination,
    "> Generated authentication: **Auth.js**. Start with [Auth.js setup](docs/authentication.md). Better Auth/Resend sections describe the alternative default, not this generated project."
  );
  await replaceEnvExample(
    destination,
    "\n# Separate GitHub OAuth app per derived project. Auth.js encrypts the session with AUTH_SECRET.\nAUTH_SECRET=\nAUTH_GITHUB_ID=\nAUTH_GITHUB_SECRET=\n"
  );
  const settings = join(
    destination,
    "apps/app/src/app/dashboard/settings/page.tsx"
  );
  await writeFile(
    settings,
    (await readFile(settings, "utf8"))
      .replace(
        'href="/forgot-password"',
        'href="https://github.com/settings/security"'
      )
      .replace("Reset your password", "Manage GitHub sign-in and security")
  );
}

export async function applySupabase(
  destination,
  variant,
  { lockfile = true } = {}
) {
  await overlayVariant(destination, variant, { lockfile });
  await removePaths(destination, [
    "packages/email",
    "apps/app/src/app/api/auth/[...all]",
    "tests/integration/flows.test.ts",
    "scripts/test-browser.mjs",
    "tests/browser-seed.ts",
  ]);
  await json(destination, "packages/auth/package.json", (pkg) => {
    pkg.exports = {
      "./client": "./client.ts",
      "./config": "./config.ts",
      "./identity": "./identity.ts",
      "./server": "./server.ts",
    };
    pkg.dependencies = {
      "@repo/database": "*",
      "@supabase/ssr": "0.12.7",
      "@supabase/supabase-js": "2.116.0",
      next: "16.3.5",
      "server-only": "0.0.1",
    };
  });
  await json(destination, "apps/app/package.json", (pkg) => {
    pkg.dependencies["@supabase/ssr"] = "0.12.7";
    pkg.dependencies["@supabase/supabase-js"] = "2.116.0";
  });
  await dropBetterAuthTooling(
    destination,
    [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ],
    "tests/integration/supabase-data.test.ts"
  );
  await prependReadme(
    destination,
    "> Generated authentication: **Supabase Auth**. Start with [Supabase Auth setup](docs/authentication.md). Better Auth/Resend sections describe the alternative default, not this generated project."
  );
  await replaceEnvExample(
    destination,
    "\n# Separate Supabase project for Auth, independent of --database. Supabase delivers auth emails.\n# Publishable/anon key is public. Never add the service role key.\nNEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\n"
  );
}

export const authOverlays = {
  appwrite: applyAppwrite,
  authjs: applyAuthjs,
  clerk: applyClerk,
  supabase: applySupabase,
};
