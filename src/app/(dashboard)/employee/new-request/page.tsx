import TimeOffRequestForm from "@/components/TimeOffRequestForm";
import { getCurrentUser } from "@/lib/auth";
import { getRequestsByUserId, getCompanyHolidays } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

const NewRequestPage = async () => {
  const user = await getCurrentUser();

  if (!user || !user.companyId) {
    redirect("/login");
  }

  const [requests, companyHolidays] = await Promise.all([
    getRequestsByUserId(user.userId),
    getCompanyHolidays(user.companyId),
  ]);

  return (
    <TimeOffRequestForm
      existingRequests={requests}
      companyHolidays={companyHolidays}
    />
  );
};

export default NewRequestPage;
