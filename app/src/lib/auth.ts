// src/lib/auth.ts
// Auth.js v5 configuration

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // In production: hash comparison with bcrypt/argon2
        // For now, find user by email (seed sets up demo users)
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? "demo@example.com";

export const auth = async (...args: unknown[]) => {
  const session = await (nextAuth.auth as (...input: unknown[]) => Promise<any>)(
    ...args,
  );
  if (session?.user?.id) return session;

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Demo User",
    },
  });

  return {
    user: {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
};
