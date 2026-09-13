---
title: "Private data"
description: "One small resource that shows how authorization should work."
sidebar:
  order: 6
---

## The example resource

Private notes demonstrate complete create, read, update, and delete behavior. Inputs use strict Zod schemas on the server. Unknown fields and invalid values are rejected.

Every query is scoped to the authenticated user. Updates and deletes include the note ID and owner ID in the SQL predicate. Foreign and missing records return the same not-found response.

## Database protection

All baseline tables have row-level security enabled without client policies. Direct access by nonowner roles without BYPASSRLS is denied. This matters when using Supabase’s public schema and Data API.

The application connects as the database owner, so server ownership checks remain mandatory. Disable the unused Supabase Data API and keep all connection strings private.

## Remove the example

Remove the notes UI, `apps/app/src/lib/notes.ts`, and `apps/app/src/app/api/notes`. Replace the dashboard view and the paid export link in settings with your product’s own functionality.

Remove the `note` table from `packages/database/src/schema.ts`, then generate and review a new migration:

```sh
npm run db:generate
npm run db:migrate
```

Do not rewrite migrations already applied to an existing project. Review data loss before applying a removal migration. Keep and extend the ownership tests for your real resources.
