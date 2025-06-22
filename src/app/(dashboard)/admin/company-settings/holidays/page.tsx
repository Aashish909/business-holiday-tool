import CompanyHolidaysForm from "@/components/CompanyHolidaysForm";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyHolidays } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

const HolidaysPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN" || !user.companyId) {
    redirect("/login");
  }

  const companyHolidays = await getCompanyHolidays(user.companyId);

  return <CompanyHolidaysForm initialHolidays={companyHolidays} />;
};

export default HolidaysPage;
