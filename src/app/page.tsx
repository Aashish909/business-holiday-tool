import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (token) {
    const user = verifyToken(token);
    if (user) {
      if (!user.onboardingCompleted) {
        redirect("/onboarding");
      } else if (user.role === "ADMIN") {
        redirect("/admin");
      } else {
        redirect("/employee");
      }
    }
  }
  
  redirect("/login");
}
