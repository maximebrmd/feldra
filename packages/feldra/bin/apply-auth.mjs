import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function applyClerk(
  destination,
  variant,
  { lockfile = true } = {}
) {
  await cp(variant, destination, {
    filter: (path) => lockfile || !path.endsWith("package-lock.json"),
    recursive: true,
  });
  for (const path of [
    "packages/auth/client.ts",
    "packages/email",
    "apps/app/src/components/auth-form.tsx",
    "apps/app/src/app/api/auth",
    "apps/app/src/app/login/page.tsx",
    "apps/app/src/app/signup/page.tsx",
    "tests/integration/flows.test.ts",
    "scripts/test-browser.mjs",
    "tests/browser-seed.ts",
  ]) {
    await rm(join(destination, path), { force: true, recursive: true });
  }
  async function json(path, update) {
    const file = join(destination, path);
    const data = JSON.parse(await readFile(file, "utf8"));
    update(data);
    await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  }
  await json("packages/auth/package.json", (pkg) => {
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
  await json("apps/app/package.json", (pkg) => {
    pkg.dependencies["@clerk/nextjs"] = "7.9.2";
  });
  await json("package.json", (pkg) => {
    delete pkg.devDependencies["better-auth"];
    delete pkg.scripts["test:browser"];
    pkg.scripts["test:integration"] = pkg.scripts["test:integration"].replace(
      "node ",
      "node --experimental-test-module-mocks "
    );
  });
  await json("turbo.json", (config) => {
    config.globalEnv = config.globalEnv.filter(
      (key) =>
        !["BETTER_AUTH_SECRET", "RESEND_API_KEY", "EMAIL_FROM"].includes(key)
    );
    config.globalEnv.push(
      "CLERK_SECRET_KEY",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    );
  });
  const envFile = join(destination, "packages/config/env.ts");
  let env = await readFile(envFile, "utf8");
  env = env
    .replace(/export function authEnv\(\) \{[\s\S]*?\n\}/u, "")
    .replace(/export function emailEnv\(\) \{[\s\S]*?\n\}/u, "");
  await writeFile(envFile, env);
  const readme = join(destination, "README.md");
  await writeFile(
    readme,
    `> Generated authentication: **Clerk**. Start with [Clerk setup](docs/authentication.md). Better Auth/Resend sections describe the alternative default, not this generated project.\n\n${await readFile(readme, "utf8")}`
  );
  const example = join(destination, ".env.example");
  await writeFile(
    example,
    (await readFile(example, "utf8")).replace(
      /^(BETTER_AUTH_SECRET|RESEND_API_KEY|EMAIL_FROM)=.*\n/gmu,
      ""
    ) +
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
  const testScript = join(destination, "scripts/test-database.mjs");
  await writeFile(
    testScript,
    (await readFile(testScript, "utf8"))
      .replace(
        '"--conditions=react-server"',
        '"--experimental-test-module-mocks", "--conditions=react-server"'
      )
      .replace(
        '"tests/integration/flows.test.ts"',
        '"tests/integration/clerk-data.test.ts"'
      )
  );
}
