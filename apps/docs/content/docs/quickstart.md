---
title: "Quickstart"
description: "From a fresh folder to a workspace that is yours."
sidebar:
  order: 1
---

## Prerequisites

Use Node.js 24 LTS, npm, and Git. Docker is needed only for local database and browser fixtures. You do not need provider credentials to build the template or run those fixtures.

## Get the source

```sh
git clone https://github.com/maximebrmd/feldra.git feldra
cd feldra
npm ci
```

## Create your project

The initializer has not been published to npm. Build the versioned local package first:

```sh
npm run initializer:pack
```

This validates the source and writes `create-feldra-VERSION.tgz` in the repository root. Replace VERSION below with the version in `initializer/package.json`:

```sh
npm exec --yes --package="./create-feldra-VERSION.tgz" -- create-feldra my-new-saas
```

Use the arrow keys and Enter to choose **Neon** or **Supabase**. The initializer installs dependencies, writes local environment files, and initializes a fresh Git repository. It refuses an existing destination, even if it is empty.

For a noninteractive run, append `--yes --database supabase` after the project name. Both relative paths and quoted paths containing spaces work.

## Connect your providers

```sh
cd my-new-saas
```

Fill in `.env.local` using the generated `DATABASE.md` and the [environment guide](/docs/environment/). A fresh local Better Auth secret is already generated; database, email, and payment credentials must be configured separately.

```sh
npm run db:migrate
npm run check
npm run dev
```

Open **localhost:3000** for marketing and **localhost:3001** for the authenticated application.

## After npm publication

Once the current package is published, project creation becomes:

```sh
npm create feldra@latest my-new-saas
```

Do not use the public command until the package is explicitly published. One command scaffolds and installs; it does not create provider accounts or configure credentials.

## Choose authentication

After selecting a database, choose **Better Auth** (default) or **Clerk**. Better Auth uses Resend for verification and reset emails. Clerk uses its managed components and email delivery; that project omits Better Auth and Resend.

For CI, add `--auth clerk` or `--auth better-auth` to the local initializer command. Combine either with `--database neon` or `--database supabase`. `--list-tools` lists supported choices without creating files. Follow the generated `AUTHENTICATION.md` before testing live authentication. These choices create independent projects; they do not migrate existing users between services.
