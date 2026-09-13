# Default authentication: Better Auth

Better Auth owns sessions and identity in Postgres. Configure a fresh `BETTER_AUTH_SECRET`, verify a Resend sending domain, and set `RESEND_API_KEY` and `EMAIL_FROM`. See [provider setup](setup.md).

The app provides signup, login, email verification, password reset and logout. Only verified users reach private APIs or pages. Reset revokes existing sessions. All private queries enforce the current user's ID; paid features also require current persisted Stripe access.

`npm run test:database` covers authentication and ownership with local Postgres/provider fixtures. `npm run test:browser` covers the two-app flow. Live email delivery and provider behavior still require your project's own credentials.

The initializer can instead generate Clerk with `--auth clerk`. That project receives a different version of this guide, Clerk components and session checks, and omits Better Auth and Resend. This is a new-project choice, not an automatic migration of existing users.
