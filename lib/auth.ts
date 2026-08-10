import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          // read:user + repo scope so we can read private repo activity too;
          // drop "repo" if you only want public activity.
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the GitHub access token on first sign-in so API routes
      // can call the GitHub API on the user's behalf.
      if (account) {
        token.accessToken = account.access_token;
      }
      // GitHub's profile has the real `login` (handle), which next-auth
      // doesn't map onto session.user by default — stash it ourselves.
      if (profile && "login" in profile) {
        token.login = (profile as any).login;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      if (session.user) {
        (session.user as any).login = token.login;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
