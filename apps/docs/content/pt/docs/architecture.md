---
title: Arquitetura
description: Apps separados. O essencial compartilhado. Um workspace coeso.
sidebar:
  order: 3
---
## O workspace [#the-workspace]

```text
apps/
  web/                  Marketing and pricing · port 3000
  app/                  Authenticated UI, APIs, webhooks · port 3001
  docs/                 Documentation · port 4321
packages/
  auth/                 Better Auth, Clerk, Auth.js, Supabase Auth, or Appwrite
  config/               App name, URLs, plans, environment validation
  database/             Drizzle schema and migrations
  design-system/        Used shadcn components and shared styles
  email/                Resend authentication emails
  payments/             Stripe state and paid-access rules
  storage/              Cloudflare R2 or Vercel Blob
turbo.json
package.json
```

Os projetos gerados incluem `apps/docs` — Blume por padrão, ou Mintlify ou Fumadocs quando selecionado. Este site do produto Feldra é um app Blume separado neste repositório; não é o app copiado para os projetos gerados.

## Limites de cada deploy [#deployable-boundaries]

`apps/web` é público. Seus links direcionam os usuários para `APP_URL` para cadastro, login e cobrança. `apps/app` é responsável pelo cookie de autenticação e por todas as rotas de API e webhook. Origens separadas evitam uma política ampla de cookies entre subdomínios.

Os pacotes compartilhados exportam código-fonte TypeScript. Cada um declara as dependências que realmente usa. Você não precisa aprender a usar adaptadores de provedores nem um framework de plugins.

## Configuração [#configuration]

Defina o nome do produto e os planos em `packages/config/index.ts`. Defina `APP_URL` e `WEB_URL` no ambiente. Altere seu preço recorrente no Stripe para corresponder ao plano configurado antes de receber pagamentos.

## Trabalhando localmente [#working-locally]

```sh
npm run dev
npm run dev --workspace web
npm run dev --workspace app
npm run typecheck
npm run lint
```

O Turborepo executa as tarefas do workspace e armazena os resultados de build em cache. Cada projeto derivado tem seu próprio arquivo de lock e seus pacotes internos `@repo/*`.
