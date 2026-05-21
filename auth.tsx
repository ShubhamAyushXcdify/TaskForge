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
  id:           data.user?.userId,
  name:         `${data.user?.firstName || ""} ${data.user?.lastName || ""}`.trim(),
  email:        data.user?.email,
  token:        data.token,
  role:         data.user?.role?.toLowerCase() ?? "user",
  firstName:    data.user?.firstName ?? "",   
  lastName:     data.user?.lastName  ?? "",   
  employeeCode: data.user?.employeeCode ?? "", 
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

callbacks: {
  async jwt({ token, user, trigger, session }) {
    if (user) {
      token.id        = user.id;
      token.email     = user.email;
      token.token     = (user as any).token;
      token.role      = (user as any).role;
      token.employeeCode = (user as any).employeeCode;
      
      token.firstName = (user as any).firstName ?? user.name?.split(" ")[0] ?? "";
      token.lastName  = (user as any).lastName  ?? user.name?.split(" ").slice(1).join(" ") ?? "";
      token.name      = user.name; 
    }

    if (trigger === "update" && session) {
      if (session.firstName) token.firstName = session.firstName;
      if (session.lastName)  token.lastName  = session.lastName;
    
      token.name = `${session.firstName ?? token.firstName} ${session.lastName ?? token.lastName}`.trim();
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id           = token.id as string;
      session.user.name         = token.name as string; // ✅ navbar reads this
      session.user.email        = token.email as string;
      session.user.token        = token.token as string;
      session.user.role         = token.role as string;
      session.user.employeeCode = token.employeeCode as string;
      // ✅ expose separately too so profile page can use them
      (session.user as any).firstName = token.firstName;
      (session.user as any).lastName  = token.lastName;
    }
    return session;
  },
},

  // 🔐 Secret (make sure this exists in .env)
  secret: process.env.AUTH_SECRET,
});