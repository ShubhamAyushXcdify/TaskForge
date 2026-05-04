// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import HomePage from "@/components/home";

// export default function Page() {
//   const router = useRouter();
//   const { data: session, status } = useSession();

//   useEffect(() => {
//     if (status === "loading") return;

//     if (status === "unauthenticated") {
//       router.replace("/login");
//     } else if (session?.user?.role === "admin") {
//       router.replace("/admin");
//     }
//   }, [status, session, router]);

//   if (status === "loading") {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (session?.user?.role === "admin") {
//     return null; 
//   }


//   return <HomePage />;
// }


import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HomePage from "@/components/home";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }


  if (session.user.role === "admin") {
    redirect("/admin");
  }


  return <HomePage />;
}