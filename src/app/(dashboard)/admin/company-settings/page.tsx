import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyById } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Clock, Building } from "lucide-react";

const CompanySettingsPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN" || !user.companyId) {
    redirect("/login");
  }

  const company = await getCompanyById(user.companyId);
  if (!company) {
    // This case should ideally not happen.
    redirect("/onboarding");
  }

  const companyName = company.name;

  const data = [
    {
      title: "Company Holidays",
      icon: CalendarDays,
      description: "Manage company holidays and time-off blackout dates",
      information:
        "Configure holidays that will automatically be excluded from time-off requests",
      href: "/admin/company-settings/holidays",
    },
    {
      title: "Company Profile",
      icon: Building,
      description: "Update your company information",
      information: "Edit your company name, website, and logo.",
      href: "/admin/company-settings/profile",
    },
    {
      title: "Working days",
      icon: Clock,
      description: "Manage company working days",
      information:
        "Set which days of the week are considered working days for your company.",
      href: "/admin/company-settings/working-days",
    },
  ];

  return (
    <div className="space-y-8 mt-12">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Company Settings</h1>
          <p className="text-gray-500">Manage settings for {companyName}</p>
        </div>
        <Button asChild variant={"outline"}>
          <Link href={"/admin"}>Back to dashboard</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <Card
            className="hover:shadow-md transition-shadow"
            key={item.title}
          >
            <Link href={item.href}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{item.title}</CardTitle>
                  <item.icon className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.information}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanySettingsPage;
