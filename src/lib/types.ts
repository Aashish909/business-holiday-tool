import { ObjectId } from "mongodb";

export interface User {
  _id: string;
  clerkId?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "EMPLOYEE";
  companyId: string;
  availableDays: number;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  _id: string;
  name: string;
  website?: string;
  logo?: string;
  workingDays: string[];
  timeOffRequests: string[];
  companyHolidays: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyHoliday {
  _id: string;
  name: string;
  date: Date;
  isRecurring: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Code {
  _id: string;
  code: string;
  companyId: string;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeOffRequest {
  _id: string;
  userId: string;
  companyId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  workingDaysCount: number;
  notes?: string;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeOffRequestWithManager extends TimeOffRequest {
  manager?: User | null;
}

export interface DetailedTimeOffRequest extends TimeOffRequest {
  employee: User;
  manager?: User;
}

export enum UserRole {
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
}

export enum TimeOffType {
  VACATION = 'VACATION',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  OTHER = 'OTHER',
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
} 