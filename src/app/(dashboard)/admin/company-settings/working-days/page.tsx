import Link from "next/link";
import { Button } from "@/components/ui/button";
import CompanyWorkingDaysForm from "@/components/CompanyWorkingDaysForm";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyById } from "@/lib/db";
import { redirect } from "next/navigation";

const WorkingDaysPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN" || !user.companyId) {
    redirect("/login");
  }

  const company = await getCompanyById(user.companyId);

  if (!company) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6 mt-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Working Days</h1>
          <p className="text-gray-500">
            Configure your company&apos;s working days
          </p>
        </div>
        <Button asChild variant={"outline"}>
          <Link href="/admin/company-settings">Back to settings</Link>
        </Button>
      </div>
      <CompanyWorkingDaysForm
        initialWorkingDays={company.workingDays || []}
      />
    </div>
  );
};

export default WorkingDaysPage;
