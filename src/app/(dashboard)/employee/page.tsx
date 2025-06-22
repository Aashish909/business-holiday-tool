"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUserClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardData {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  availableDays: number;
}

const EmployeeDashboardPage = () => {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = await getCurrentUserClient();

        if (!user) {
          router.push("/login");
          return;
        }

        const response = await fetch('/api/dashboard/employee');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-8 mt-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8 mt-12">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <p className="text-gray-500">Manage your time off requests.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time Off Requests</CardTitle>
            <CardDescription>Manage your time off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/employee/new-request">New request</Link>
              </Button>
              <Button asChild variant={"outline"}>
                <Link href="/employee/my-requests">View My Requests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile & Company</CardTitle>
            <CardDescription>View your profile and company information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button asChild variant={"outline"}>
                <Link href="/employee/profile">My Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick overview</CardTitle>
            <CardDescription>Your time off at a glance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-100 p-5 text-center">
                <div className="text-2xl font-bold">{data.totalRequests}</div>
                <div className="text-sm text-gray-500">Total Requests</div>
              </div>
              <div className="rounded-lg bg-gray-100 p-5 text-center">
                <div className="text-2xl font-bold">{data.approvedRequests}</div>
                <div className="text-sm text-gray-500">Approved Requests</div>
              </div>
              <div className="rounded-lg bg-gray-100 p-5 text-center">
                <div className="text-2xl font-bold">{data.pendingRequests}</div>
                <div className="text-sm text-gray-500">Pending Requests</div>
              </div>
              <div className="rounded-lg bg-gray-100 p-5 text-center">
                <div className="text-2xl font-bold">
                  {data.availableDays}
                </div>
                <div className="text-sm text-gray-500">Days Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
