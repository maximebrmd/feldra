import "server-only";
import { appConfig } from "@repo/config";
import { emailEnv } from "@repo/config/env";
import { Resend } from "resend";
export async function sendAuthEmail(
  to: string,
  url: string,
  kind: "verify" | "reset"
) {
  const env = emailEnv();
  const subject =
    kind === "verify" ? "Verify your email" : "Reset your password";
  const { error } = await new Resend(env.RESEND_API_KEY).emails.send({
    from: env.EMAIL_FROM,
    subject: `${subject} · ${appConfig.name}`,
    text: `${subject} for ${appConfig.name}:\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
    to,
  });
  if (error) {
    throw new Error("Authentication email delivery failed. Please retry.");
  }
}
