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