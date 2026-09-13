# Direct dependencies

Exact versions are pinned in package.json and package-lock.json. Generated projects install them using npm ci. The initializer itself has **zero runtime dependencies**.

| Runtime dependency | Version | Why it exists |
| --- | --- | --- |
| `@better-auth/drizzle-adapter` | 1.7.4 | Official Better Auth persistence through the same Drizzle schema. |
| `@radix-ui/react-slot` | 1.3.3 | Button asChild composition with Next links. |
| `better-auth` | 1.7.4 | Email/password auth, verification/reset tokens, sessions and rate limiting. |
| `class-variance-authority` | 0.7.1 | Variants in the used shadcn Button. |
| `clsx` | 2.1.1 | Conditional classes for the shadcn cn helper. |
| `drizzle-orm` | 0.45.2 | Typed SQL queries, ownership predicates and transactional billing updates. |
| `next` | 16.3.5 | App Router, Server Components, route handlers and production server. |
| `pg` | 8.23.0 | Standard Postgres driver for Neon and local integration tests. |
| `react` | 19.3.0 | UI components and form state. |
| `react-dom` | 19.3.0 | Browser rendering and Next.js React integration. |
| `resend` | 6.28.0 | Transactional verification and password-reset email delivery. |
| `server-only` | 0.0.1 | Build-time prevention of server modules entering client bundles. |
| `stripe` | 22.6.2 | Hosted Checkout, customer portal, subscription reads and signature verification. |
| `tailwind-merge` | 3.7.0 | Resolve Tailwind class conflicts in the used UI components. |
| `zod` | 4.6.4 | Strict server inputs and validated environment variables. |

## Development dependencies

| Dependency | Version | Purpose |
| --- | --- | --- |
| `@biomejs/biome` | 2.5.13 | Engine for Ultracite linting and formatting. |
| `@playwright/test` | 1.63.0 | Chromium and assertions for actual production UI tests. |
| `@tailwindcss/postcss` | 4.3.3 | Compile the used Tailwind styles with Next. |
| `@types/node` | 26.5.1 | Type declarations for the corresponding runtime library. |
| `@types/pg` | 8.23.1 | Type declarations for the corresponding runtime library. |
| `@types/react` | 19.3.0 | Type declarations for the corresponding runtime library. |
| `@types/react-dom` | 19.3.0 | Type declarations for the corresponding runtime library. |
| `drizzle-kit` | 0.31.10 | Generate reviewable SQL migrations. |
| `tailwindcss` | 4.3.3 | Tailwind CSS compiler. |
| `tsx` | 4.23.13 | Execute TypeScript migrations and Node tests. |
| `typescript` | 7.0.2 | Static type checking. |
| `ultracite` | 7.11.1 | Shared lint/format presets and CLI. |

A narrow override pins `@esbuild-kit/core-utils`’ esbuild to 0.25.12 to remove the older vulnerable development server dependency inherited through drizzle-kit. Migration generation and execution are tested with the override. No additional framework, abstraction, analytics, AI, CMS, collaboration or notification dependencies are included directly. Transitive dependencies follow these libraries and are locked.
