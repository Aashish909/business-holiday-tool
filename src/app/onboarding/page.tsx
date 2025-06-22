"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingForm from "@/components/OnboardingForm";

export default function OnboardingPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          console.log("Onboarding page - user data:", data);
          
          if (data.user.onboardingCompleted) {
            console.log("User already completed onboarding, redirecting to dashboard");
            if (data.user.role === "ADMIN") {
              router.replace("/admin");
            } else {
              router.replace("/employee");
            }
            return;
          }
          
          setUserData(data.user);
        } else {
          console.log("No user found, redirecting to login");
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking user:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <OnboardingForm
          userEmail={userData.email}
          firstName={userData.firstName}
          lastName={userData.lastName}
          userId={userData.id}
        />
      </div>
    </div>
  );
}