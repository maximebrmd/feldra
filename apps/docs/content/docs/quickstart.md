---
title: "Quickstart"
description: "From a fresh folder to a workspace that is yours."
sidebar:
  order: 1
---

## Prerequisites

Use Node.js 24 LTS, Bun 1.4.0, and Git. Docker is needed only for local database and browser fixtures. You do not need provider credentials to build the template or run those fixtures.

## Get the source

```sh
git clone https://github.com/maximebrmd/feldra.git feldra
cd feldra
bun install
```

## Create your project

The initializer has not been published to npm. Build the versioned local package first:

```sh
bun run initializer:pack
```

This validates the source and writes `feldra-VERSION.tgz` in the repository root. Replace VERSION below with the version in `packages/feldra/package.json`:

```sh
npm exec --yes --package="./feldra-VERSION.tgz" -- feldra create my-new-saas
```

Use the arrow keys and Enter to choose **Neon** or **Supabase**, then **Better Auth**, **Clerk**, **Auth.js**, **Supabase Auth**, or **Appwrite**, **Cloudflare R2** or **Vercel Blob** storage, and **Blume**, **Mintlify**, or **Fumadocs**. The initializer installs dependencies, writes local environment files, and initializes a fresh Git repository. It refuses an existing destination, even if it is empty.

For a noninteractive run, append `--yes --database supabase --storage blob --docs mintlify` after the project name. `--storage` defaults to Cloudflare R2; each generated project includes `STORAGE.md` with provider-specific setup and credential guidance. `--docs` defaults to `blume`. Both relative paths and quoted paths containing spaces work.

## Connect your providers

```sh
cd my-new-saas
```

Fill in `.env.local` using the generated `DATABASE.md`, `AUTHENTICATION.md`, `STORAGE.md`, and the [environment guide](/docs/environment/). A fresh local Better Auth or Auth.js secret is already generated; credentials for Clerk, Supabase Auth, Appwrite, and the remaining providers must be configured separately.

```sh
npm run db:migrate
npm run check
npm run dev
```

Open **localhost:3000** for marketing and **localhost:3001** for the authenticated application.

## After npm publication

Once the current package is published, project creation becomes:

```sh
npx feldra@latest create my-new-saas
```

Equivalent: `npm exec feldra@latest -- create my-new-saas`. Do not use the public command until the package is explicitly published. One command scaffolds and installs; it does not create provider accounts or configure credentials.

## Choose authentication

After selecting a database, choose **Better Auth** (default), **Clerk**, **Auth.js**, **Supabase Auth**, or **Appwrite**. Better Auth uses Resend for verification and reset emails. Clerk uses its managed components and email delivery. Auth.js uses GitHub OAuth. Supabase Auth uses the Supabase Auth API and is independent of the database choice. Appwrite uses managed identity and auth emails. Clerk, Auth.js, Supabase Auth, and Appwrite projects omit Better Auth and Resend.

For CI, add `--auth better-auth`, `--auth clerk`, `--auth authjs`, `--auth supabase`, or `--auth appwrite` to the local initializer command. Combine any of these with `--database neon` or `--database supabase` and `--docs blume`, `--docs mintlify`, or `--docs fumadocs`. `--list-tools` lists supported choices without creating files. Follow the generated `AUTHENTICATION.md` before testing live authentication. These choices create independent projects; they do not migrate existing users between services. This repository's product docs stay on Blume.
