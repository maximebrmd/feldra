import "server-only";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { appConfig } from "@repo/config";
import { appUrl, authEnv } from "@repo/config/env";
import { db } from "@repo/database";
// biome-ignore lint/performance/noNamespaceImport: Drizzle needs the complete table schema.
import * as schema from "@repo/database/schema";
import { sendAuthEmail } from "@repo/email";
import { betterAuth } from "better-auth";
export function createAuth() {
  return betterAuth({
    advanced: { ipAddress: { ipAddressHeaders: ["x-vercel-forwarded-for"] } },
    appName: appConfig.name,
    baseURL: appUrl(),
    database: drizzleAdapter(db(), {
      provider: "pg",
      schema,
      transaction: true,
    }),
    emailAndPassword: {
      enabled: true,
      maxPasswordLength: 128,
      minPasswordLength: 12,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, url }) =>
        sendAuthEmail(user.email, url, "reset"),
    },
    emailVerification: {
      autoSignInAfterVerification: false,
      sendOnSignIn: true,
      sendOnSignUp: true,
      sendVerificationEmail: ({ user, url }) =>
        sendAuthEmail(user.email, url, "verify"),
    },
    rateLimit: {
      customRules: {
        "/request-password-reset": { max: 3, window: 60 },
        "/send-verification-email": { max: 3, window: 60 },
        "/sign-in/email": { max: 5, window: 60 },
        "/sign-up/email": { max: 5, window: 60 },
      },
      enabled: true,
      max: 60,
      storage: "database",
      window: 60,
    },
    secret: authEnv().BETTER_AUTH_SECRET,
    session: { cookieCache: { enabled: false } },
    trustedOrigins: [appUrl()],
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function auth() {
  instance ??= createAuth();
  return instance;
}
