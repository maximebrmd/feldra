import "server-only";
import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      id: string;
      name: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    jwt({ profile, token }) {
      if (
        profile &&
        "id" in profile &&
        profile.id !== undefined &&
        profile.id !== null
      ) {
        token.sub = `github:${profile.id}`;
        if (typeof profile.email === "string") {
          token.email = profile.email;
        }
        if (typeof profile.name === "string") {
          token.name = profile.name;
        } else if ("login" in profile && typeof profile.login === "string") {
          token.name = profile.login;
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.email = token.email ?? "";
      session.user.name = token.name ?? "";
      return session;
    },
  },
  pages: { signIn: "/login" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  trustHost: true,
});
