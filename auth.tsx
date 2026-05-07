import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" }, 
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          
          const res = await fetch(`${process.env.BACKEND_URL}/api/Auth/Login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.username,   
              password: credentials.password,
            }),
          });

          const text = await res.text();

          let data;
          try {
            data = JSON.parse(text);
          } catch {
            return null;
          }
         
          if (!res.ok || !data?.success || !data?.token) {
            return null;
          }

          return {
            id: data.user?.UserId,
            name: `${data.user?.FirstName || ""} ${data.user?.LastName || ""}`,
            email: data.user?.Email,
            token: data.token,
            role: data.user?.Role
              ? data.user.Role.toLowerCase()
              : "user",
          };

        } catch (error) {
          return null;
        }
      },
    }),
  ],

  // 🔐 Custom login page
  pages: {
    signIn: "/login",
  },

  // 🔑 JWT strategy
  session: {
    strategy: "jwt",
  },

  // 🔄 Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.token = user.token;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.token = token.token as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  // 🔐 Secret (make sure this exists in .env)
  secret: process.env.AUTH_SECRET,
});