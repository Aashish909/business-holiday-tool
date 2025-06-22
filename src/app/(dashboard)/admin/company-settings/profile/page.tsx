import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyById } from "@/lib/db";
import CompanyProfileForm from "@/components/CompanyProfileForm";

const CompanyProfilePage = async () => {
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
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-gray-500">Update your company profile</p>
        </div>
        <Button asChild variant={"outline"}>
          <Link href={`/admin/company-settings`}>Back to settings</Link>
        </Button>
      </div>
      <CompanyProfileForm
        initialData={{
          name: company.name,
          website: company.website || "",
          logo: company.logo || "",
        }}
      />
    </div>
  );
};

export default CompanyProfilePage;
