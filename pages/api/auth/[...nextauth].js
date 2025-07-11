import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "../../../model/UserModel";
import DBConnect from "../../../lib/database";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "mail@site.com" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await DBConnect();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            isApproved: user.isApproved,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 saat
    updateAge: 24 * 60 * 60, // Sadece token süresi dolduğunda güncelle
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "github") {
        try {
          await DBConnect();

          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // İlk kullanıcıyı kontrol et (admin olarak ayarla)
            const userCount = await User.countDocuments();
            const isFirstUser = userCount === 0;

            existingUser = await User.create({
              name: user.name,
              email: user.email,
              provider: account.provider,
              providerId: account.providerAccountId,
              role: isFirstUser ? "admin" : "user",
              isApproved: isFirstUser ? true : false,
            });
          }

          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.isApproved = existingUser.isApproved;
          return true;
        } catch (error) {
          console.error("SignIn callback error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.isApproved = user.isApproved;
      }

      // Sadece manuel update trigger'ında veritabanını kontrol et
      if (trigger === "update" && token.id) {
        try {
          await DBConnect();
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            token.role = dbUser.role;
            token.isApproved = dbUser.isApproved;
            token.name = dbUser.name;
            token.email = dbUser.email;
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.isApproved = token.isApproved;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/api/auth/signin",
    signUp: "/api/auth/register",
    error: "/api/auth/error",
  },
};

export default NextAuth(authOptions);
