import { basename, resolve } from "node:path";

export const stackSummary =
  "Next.js + TypeScript · Drizzle · Better Auth · Stripe · Resend · Tailwind + shadcn · Ultracite\n2 apps: web (3000), app (3001) · 6 shared packages · Turborepo + npm workspaces";

export const databases = {
  neon: {
    hint: "Serverless Postgres (default)",
    instructions:
      "Create a NEW Neon project. Copy its pooled connection string to DATABASE_URL and direct connection string to DATABASE_URL_UNPOOLED.",
    label: "Neon",
  },
  supabase: {
    hint: "Postgres only · authentication stays on Better Auth",
    instructions:
      "Create a NEW Supabase project. In Connect, copy the transaction pooler URL (port 6543) to DATABASE_URL. Set DATABASE_URL_UNPOOLED to the direct URL, or session pooler URL (port 5432) on IPv4-only networks. Disable the unused Data API in project settings. See docs/databases.md before migrating.",
    label: "Supabase",
  },
};

export async function collectSetup(options, prompts) {
  if (
    options.database &&
    options.preset &&
    options.database !== options.preset
  ) {
    throw new Error("--database and --preset must agree; prefer --database.");
  }
  let database = options.database || options.preset;
  if (database && !Object.hasOwn(databases, database)) {
    throw new Error("Choose --database neon or --database supabase.");
  }
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
      "Provide a destination in noninteractive mode: npm create saas-keel@latest my-new-saas -- --yes"
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
  database ||= prompts
    ? await prompts.select({
        initialValue: "neon",
        message: "Which database do you want to use?",
        options: Object.entries(databases).map(([value, config]) => ({
          hint: config.hint,
          label: config.label,
          value,
        })),
      })
    : "neon";
  if (
    prompts &&
    !(await prompts.confirm({
      initialValue: true,
      message: `Create ${name} with ${databases[database].label}?`,
    }))
  ) {
    throw new Error("Canceled. No project files were created.");
  }
  return { directory, name, preset: database };
}
