"use server";

import { getCurrentUser } from "@/lib/auth";
import { createTimeOffRequest as createRequest } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTimeOffRequest(data: {
  startDate: Date;
  endDate: Date;
  type: string;
  reason?: string;
  workingDaysCount: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.companyId) {
      throw new Error("Unauthorized");
    }

    const { startDate, endDate, type, reason, workingDaysCount } = data;

    if (!startDate || !endDate || !type) {
      throw new Error("Missing required fields");
    }

    const requestToCreate = {
      startDate,
      endDate,
      type,
      reason: reason || "",
      userId: user.userId,
      companyId: user.companyId,
      workingDaysCount,
      status: "PENDING" as const,
    };

    console.log("Creating time off request with data:", requestToCreate);

    const timeOffRequest = await createRequest(requestToCreate);

    console.log("Created time off request:", timeOffRequest);

    revalidatePath("/employee/my-requests");
    revalidatePath("/employee");
    revalidatePath("/admin/time-off-requests");
    revalidatePath("/admin");
    
    return { success: true, data: timeOffRequest };
  } catch (error) {
    console.error("Error creating time off request:", error);
    return { success: false, error: "Failed to create request" };
  }
}
