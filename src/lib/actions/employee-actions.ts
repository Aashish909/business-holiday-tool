"use server";

import { getCurrentUser } from "@/lib/auth";
import { createTimeOffRequest as createRequest } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { findUserById, updateUser } from '@/lib/db';

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

export async function updateEmployeeProfile({
  firstName,
  lastName,
  email,
  department,
}: {
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in.",
      };
    }

    const dbUser = await findUserById(user.userId);
    if (!dbUser) {
      return {
        success: false,
        error: "User not found in database",
      };
    }

    // Check if email is being changed and if it's already taken by another user
    if (email !== dbUser.email) {
      const existingUser = await findUserById(email);
      if (existingUser && existingUser._id !== dbUser._id) {
        return {
          success: false,
          error: "Email address is already in use",
        };
      }
    }

    // Update the user profile
    await updateUser(dbUser._id, {
      firstName,
      lastName,
      email,
      department,
    });

    revalidatePath("/employee/profile");
    revalidatePath("/employee");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating employee profile:", error);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}
