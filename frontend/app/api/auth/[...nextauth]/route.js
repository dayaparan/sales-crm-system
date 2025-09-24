import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (profile?.email) {
        token.email = profile.email;
      }
      if (user?.backendData) {
        token.branch = user.backendData.branch;
        token.role = user.backendData.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email;
      }

      session.user.role = token.role;
      session.user.branchId = token.branch;
      delete session.user.image;
      delete session.user.name;
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        return `/dashboard/login?error=${encodeURIComponent("Backend API URL not configured")}`;
      }
      console.log(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/auth/signIn`);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/auth/signIn`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: profile?.email || user.email,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          return `/dashboard/login?error=${encodeURIComponent(data.message || "Authentication failed")}`;
        }

        // Store API response in user object for JWT callback
        user.backendData = {
          role: data.user.role,
          branch: data.user.branch,
        };
        return true;
      } catch (error) {
        console.error("Error sending data to API:", error);
        return `/dashboard/login?error=${encodeURIComponent("Server error during authentication")}`;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("/api/auth/callback")) {
        return `${baseUrl}/dashboard`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
