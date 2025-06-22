import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  getCompanyById,
  countPendingRequests,
  countApprovedRequests,
  countEmployees,
} from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminDashboardPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN" || !user.companyId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  const [company, pendingRequests, approvedRequests, employeeCount] =
    await Promise.all([
      getCompanyById(user.companyId),
      countPendingRequests(user.companyId),
      countApprovedRequests(user.companyId),
      countEmployees(user.companyId),
    ]);

  if (!company) {
    // This case should ideally not happen if the user has a companyId
    // but it's good practice to handle it.
    redirect("/onboarding");
  }

  const companyName = company.name;

  const data = [
    { title: "Pending Requests", data: pendingRequests },
    { title: "Approved Requests", data: approvedRequests },
    { title: "Employee Count", data: employeeCount },
  ];

  return (
    <div className="space-y-8 mt-12">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">{companyName} Dashboard</h1>
        <p className="text-gray-500">Manage your company and employees</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data.map((item) => (
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
