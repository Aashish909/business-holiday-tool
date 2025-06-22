"use server";
import { createUser, createCompany, findCodeByValue, updateCode, updateUser, findUserById } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { revalidatePath } from "next/cache";

export async function createEmployee(
  department: string | undefined,
  userId: string,
  invitationCode: string
) {
  try {
    // Find the invitation code
    const code = await findCodeByValue(invitationCode);
    if (!code) {
      throw new Error("Invalid invitation code");
    }

    // Update user with company info
    await updateUser(userId, {
      role: UserRole.EMPLOYEE,
      department: department || undefined,
      companyId: code.companyId,
    });

    // Mark code as used
    await updateCode(code._id, { used: true });

    // Generate new token with updated info
    const updatedUser = await findUserById(userId);
    if (updatedUser) {
      const token = generateToken({
        userId: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        companyId: updatedUser.companyId,
        onboardingCompleted: true,
      });
      
      return {
        success: true,
        token,
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          companyId: updatedUser.companyId,
          onboardingCompleted: true,
        },
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}

export async function createAdmin(
  companyName: string,
  companyWebsite: string,
  companyLogo: string,
  userId: string
) {
  try {
    // Create company
    const company = await createCompany({
      name: companyName,
      website: companyWebsite,
      logo: companyLogo,
      workingDays: [],
      timeOffRequests: [],
      companyHolidays: [],
    });

    // Update user with company info
    await updateUser(userId, {
      role: UserRole.ADMIN,
      companyId: company._id,
    });

    // Generate new token with updated info
    const updatedUser = await findUserById(userId);
    if (updatedUser) {
      const token = generateToken({
        userId: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        companyId: updatedUser.companyId,
        onboardingCompleted: true,
      });
      
      return {
        success: true,
        token,
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          companyId: updatedUser.companyId,
          onboardingCompleted: true,
        },
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}
