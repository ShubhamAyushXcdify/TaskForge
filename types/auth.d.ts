import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
      token: string;
      role:string;
    };
  }

  interface User {
    username: string;
    token: string;
    role:string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    token: string;
    role:string;
  }
}