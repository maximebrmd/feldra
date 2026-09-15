# Feature flags

This project includes the provider-agnostic [Flags SDK](https://flags-sdk.dev/) in `@repo/feature-flags`. The package is server-only and is available to the authenticated app. No flag provider or external account was provisioned.

## Local setup

1. Keep the generated `FLAGS_SECRET` in `.env.local`. Use a different random value for development, preview, and production. To generate another value:

   ```sh
   node -e "console.log(crypto.randomBytes(32).toString('base64url'))"
   ```

2. The example `showBetaFeature` flag reads `SHOW_BETA_FEATURE`. It is `false` unless the value is exactly `true`:

   ```sh
   SHOW_BETA_FEATURE=true npm run dev --workspace app
   ```

   Restart the app after changing `.env.local`.

3. Define additional flags in `packages/feature-flags/index.ts` with `flag` from `flags/next`. Every flag must have a safe `defaultValue` and a `decide` function (or a provider adapter).

## Using a flag

Evaluate flags on the server, for example in a Server Component or Route Handler:

```tsx
import { showBetaFeature } from "@repo/feature-flags";

const isEnabled = await showBetaFeature();
```

Do not import this package into client components. Pass only the resulting value to client code when needed.

## Flags Explorer and providers

The application exposes `/.well-known/vercel/flags` for the Flags Explorer. It is protected by `FLAGS_SECRET`; configure the same secret in the environment used by the linked Vercel project before using toolbar overrides.

The default package has no provider dependency. When runtime rollouts are needed, add the provider adapter documented by the Flags SDK, then replace the example `decide` function and document its credentials here. Never commit provider keys or reuse another project's resources.
