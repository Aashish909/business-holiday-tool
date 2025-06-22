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
  pendingRequests: number;
  approvedRequests: number;
  employeeCount: number;
  companyName: string;
}

const AdminDashboardPage = () => {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = await getCurrentUserClient();

        if (!user || user.role !== "ADMIN" || !user.companyId) {
          router.push("/login");
          return;
        }

        const response = await fetch('/api/dashboard/admin');
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

  const statsData = [
    { title: "Pending Requests", data: data.pendingRequests },
    { title: "Approved Requests", data: data.approvedRequests },
    { title: "Employee Count", data: data.employeeCount },
  ];

  return (
    <div className="space-y-8 mt-12">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">{data.companyName} Dashboard</h1>
        <p className="text-gray-500">Manage your company and employees</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((item) => (
          <Card key={item.title}>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">{item.title}</p>
              <h3 className="text-2xl font-semibold">{item.data}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Time Off Requests</CardTitle>
            <CardDescription>Manage employee time off requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/admin/time-off-requests">View all requests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>Manage company configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/admin/company-settings">General settings</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/company-settings/holidays">
                  Company Holidays
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/company-settings/working-days">
                  Working Days
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team management</CardTitle>
            <CardDescription>Manage your company&apos;s team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/admin/employees">View Employees</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/invitation-codes">Invitation Codes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
