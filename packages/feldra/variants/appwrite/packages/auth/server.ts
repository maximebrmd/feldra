import "server-only";
import { appUrl } from "@repo/config/env";
import { cookies } from "next/headers";
import { Account, Client, ID } from "node-appwrite";
import { appwriteEnv } from "./config";
import { verifiedIdentity } from "./identity";
import { persistIdentity } from "./sync";

export const SESSION_COOKIE = "appwrite-session";

function sessionCookieOptions(expire: string) {
  return {
    expires: new Date(expire),
    httpOnly: true,
    path: "/",
    sameSite: "strict" as const,
    secure: true,
  };
}

function adminClient() {
  const env = appwriteEnv();
  return new Client()
    .setEndpoint(env.endpoint)
    .setProject(env.projectId)
    .setKey(env.apiKey);
}

function projectClient() {
  const env = appwriteEnv();
  return new Client().setEndpoint(env.endpoint).setProject(env.projectId);
}

export function createAdminClient() {
  const client = adminClient();
  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createSessionClient() {
  const client = projectClient();
  const session = (await cookies()).get(SESSION_COOKIE);
  if (!session?.value) {
    throw new Error("No session");
  }
  client.setSession(session.value);
  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function setSessionCookie(secret: string, expire: string) {
  (await cookies()).set(SESSION_COOKIE, secret, sessionCookieOptions(expire));
}

export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(new Date(0).toISOString()),
    expires: new Date(0),
  });
}

function accountFromSecret(secret: string) {
  const client = projectClient();
  client.setSession(secret);
  return new Account(client);
}

export async function readAppwriteAccount() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch {
    return null;
  }
}

export function readAccountWithSecret(secret: string) {
  return accountFromSecret(secret).get();
}

export async function currentAppUser() {
  const identity = await readAppwriteAccount();
  if (!identity) {
    return null;
  }
  return persistIdentity(verifiedIdentity(identity.$id, identity));
}

export async function registerAccount(input: {
  email: string;
  name: string;
  password: string;
}) {
  const { account } = createAdminClient();
  await account.create({
    email: input.email,
    name: input.name,
    password: input.password,
    userId: ID.unique(),
  });
  return account.createEmailPasswordSession({
    email: input.email,
    password: input.password,
  });
}

export function createEmailSession(email: string, password: string) {
  const { account } = createAdminClient();
  return account.createEmailPasswordSession({ email, password });
}

export async function requestEmailVerification(secret?: string) {
  const account = secret
    ? accountFromSecret(secret)
    : (await createSessionClient()).account;
  await account.createEmailVerification({ url: `${appUrl()}/verify-email` });
}

export async function completeEmailVerification(
  userId: string,
  secret: string
) {
  const account = new Account(projectClient());
  await account.updateEmailVerification({ secret, userId });
}

export async function requestPasswordRecovery(email: string) {
  const { account } = createAdminClient();
  await account.createRecovery({ email, url: `${appUrl()}/reset-password` });
}

export async function completePasswordRecovery(input: {
  password: string;
  secret: string;
  userId: string;
}) {
  const account = new Account(projectClient());
  await account.updateRecovery({
    password: input.password,
    secret: input.secret,
    userId: input.userId,
  });
}

export async function destroySession() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession({ sessionId: "current" });
  } catch {
    // Clearing the cookie still ends this application's session.
  }
  await clearSessionCookie();
}
