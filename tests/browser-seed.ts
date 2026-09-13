import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { db } from "../src/lib/db";
import { account, user } from "../src/lib/db/schema";

const url = process.env.DATABASE_URL;
if (
  !(
    url &&
    ["127.0.0.1", "localhost"].includes(new URL(url).hostname) &&
    new URL(url).pathname.endsWith("_test")
  )
) {
  throw new Error("Browser seed requires disposable local _test database");
}
const id = randomUUID();
try {
  await db().insert(user).values({
    email: "browser@example.com",
    emailVerified: true,
    id,
    name: "Browser User",
  });
  await db()
    .insert(account)
    .values({
      accountId: id,
      id: randomUUID(),
      password: await hashPassword("browser-test-password"),
      providerId: "credential",
      userId: id,
    });
} finally {
  await db().$client.end();
}
