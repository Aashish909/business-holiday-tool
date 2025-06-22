"use server";
import { getCurrentUser } from '@/lib/auth';
import { 
  updateCompany, 
  findUserById, 
  deleteCompanyHoliday as deleteHoliday, 
  createCompanyHoliday, 
  updateCompanyHoliday as updateHoliday,
  updateUser,
  createCode,
  findCodesByCompanyId,
  findTimeOffRequestById,
  updateTimeOffRequest
} from '@/lib/db';
import { revalidatePath } from "next/cache";

export async function updateCompanyProfile({
  name,
  website,
  logo,
}: {
  name: string;
  website?: string;
  logo?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const dbUser = await findUserById(user.userId);
    if (!dbUser) {
      throw new Error("User not found");
    }

    if (dbUser.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    await updateCompany(dbUser.companyId, {
      name,
      website,
      logo,
    });

    revalidatePath("/admin/company-settings/profile");
    revalidatePath("/admin/company-settings");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update company profile");
  }
}

export async function updateCompanyWorkingDays(workingDays: string[]) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const dbUser = await findUserById(user.userId);
    if (!dbUser) {
      throw new Error("User not found");
    }

    if (dbUser.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    await updateCompany(dbUser.companyId, {
      workingDays,
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update company working days");
  }
}

export async function deleteCompanyHoliday(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const dbUser = await findUserById(user.userId);
    if (!dbUser) {
      throw new Error("User not found in database");
    }

    if (dbUser.role !== "ADMIN") {
      throw new Error("Only admins can delete company holidays");
    }

    await deleteHoliday(id);

    revalidatePath("/admin/company-settings/holidays");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete company holiday");
  }
}

export async function addCompanyHoliday({
  name,
  date,
  isRecurring,
}: {
  name: string;
  date: Date;
  isRecurring: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorised. Please sign in.");
  }

  try {
    console.log("Adding company holiday:", { name, date, isRecurring, userId: user.userId });
    
    const dbUser = await findUserById(user.userId);
    if (!dbUser) {
      throw new Error("User not found in database");
    }

    if (dbUser.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    console.log("Creating holiday with companyId:", dbUser.companyId);

    await createCompanyHoliday({
      name,
      date,
      isRecurring,
      companyId: dbUser.companyId,
    });

    console.log("Holiday created successfully");

    revalidatePath("/admin/company-settings/holidays");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in addCompanyHoliday:", error);
    throw new Error("Failed to add company holiday");
  }
}

export async function updateCompanyHoliday({
  id,
  name,
  date,
  isRecurring,
}: {
  id: string;
  name: string;
  date: Date;
  isRecurring: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    console.log("Updating company holiday:", { id, name, date, isRecurring, userId: user.userId });
    
    const dbUser = await findUserById(user.userId);
    if (!dbUser) {
      throw new Error("User not found in database");
    }

    if (dbUser.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    console.log("Updating holiday with ID:", id);

    await updateHoliday(id, {
      name,
      date,
      isRecurring,
    });

    console.log("Holiday updated successfully");

    revalidatePath("/admin/company-settings/holidays");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in updateCompanyHoliday:", error);
    throw new Error("Failed to update company holiday");
  }
}

export async function updateEmployeeAllowance({
  employeeId,
  availableDays,
}: {
  employeeId: string;
  availableDays: number;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    console.log("Updating employee allowance:", { employeeId, availableDays, userId: user.userId });
    
    const dbUser = await findUserById(user.userId);
    if (!dbUser) {
      throw new Error("User not found in database");
    }

    if (dbUser.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    console.log("Admin user found:", { adminId: dbUser._id, adminCompanyId: dbUser.companyId });

    const employee = await findUserById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    console.log("Employee found:", { employeeId: employee._id, employeeCompanyId: employee.companyId });

    // Convert both company IDs to strings for comparison
    const adminCompanyIdStr = dbUser.companyId?.toString();
    const employeeCompanyIdStr = employee.companyId?.toString();

    console.log("Company ID comparison:", { 
      adminCompanyId: adminCompanyIdStr, 
      employeeCompanyId: employeeCompanyIdStr,
      areEqual: adminCompanyIdStr === employeeCompanyIdStr 
    });

    if (adminCompanyIdStr !== employeeCompanyIdStr) {
      throw new Error("You can only update employees in your company");
    }

    console.log("Updating employee with new allowance:", availableDays);

    await updateUser(employeeId, {
      availableDays,
    });

    console.log("Employee allowance updated successfully");

    revalidatePath("/admin/employees");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in updateEmployeeAllowance:", error);
    throw new Error("Failed to update employee allowance");
  }
}

export async function generateInvitationCode() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.companyId) {
    throw new Error("Unauthorized");
  }

  try {
    const generateRandomCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    let code = generateRandomCode();
    const existingCodes = await findCodesByCompanyId(user.companyId);
    const codeValues = existingCodes.map((c) => c.code);

    while (codeValues.includes(code)) {
      code = generateRandomCode();
    }

    const newCode = await createCode({
      code,
      companyId: user.companyId,
      used: false,
    });

    revalidatePath("/admin/invitation-codes");

    return newCode;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate invitation code");
  }
}

export async function updateTimeOffRequestStatus({
  requestId,
  status,
  notes,
}: {
  requestId: string;
  status: "APPROVED" | "REJECTED";
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const dbUser = await findUserById(user.userId);
    if (!dbUser) {
      throw new Error("User not found in database");
    }

    if (dbUser.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const request = await findTimeOffRequestById(requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    const employee = await findUserById(request.userId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    if (employee.companyId?.toString() !== dbUser.companyId?.toString()) {
      throw new Error(
        "You can only update requests for employees in your company"
      );
    }

    await updateTimeOffRequest(requestId, {
      status,
      notes,
      managerId: dbUser._id,
    });

    revalidatePath("/admin/time-off-requests");
    revalidatePath(`/admin/time-off-requests/${requestId}`);
    revalidatePath("/admin");
    revalidatePath(`/employee/my-requests`);
    revalidatePath("/employee");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating time off request status:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: "Failed to update request status: " + errorMessage,
    };
  }
}
