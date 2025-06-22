import clientPromise from './mongodb';
import { User, Company, CompanyHoliday, Code, TimeOffRequest } from './types';
import { ObjectId } from 'mongodb';

const DATABASE_NAME = 'holiday-tool';

export async function getDb() {
  const client = await clientPromise;
  return client.db(DATABASE_NAME);
}

// User operations
export async function createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const db = await getDb();
  const now = new Date();
  const user = {
    ...userData,
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await db.collection('users').insertOne(user);
  return { ...user, _id: result.insertedId.toString() };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ email }) as User & { _id: ObjectId } | null;
  return user ? { ...user, _id: user._id.toString() } : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: new ObjectId(id) }) as User & { _id: ObjectId } | null;
  return user ? { ...user, _id: user._id.toString() } : null;
}

export async function updateUser(id: string, updateData: Partial<User>): Promise<void> {
  const db = await getDb();
  console.log("Updating user in database:", { id, updateData });
  
  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );
  
  console.log("User update result:", result);
  
  if (result.matchedCount === 0) {
    console.warn("No user found with ID:", id);
  }
  
  if (result.modifiedCount === 0) {
    console.warn("No changes made to user with ID:", id);
  }
}

// Company operations
export async function createCompany(companyData: Omit<Company, '_id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
  const db = await getDb();
  const now = new Date();
  const company = {
    ...companyData,
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await db.collection('companies').insertOne(company);
  return { ...company, _id: result.insertedId.toString() };
}

export async function updateCompany(id: string, updateData: Partial<Company>): Promise<void> {
  const db = await getDb();
  await db.collection('companies').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );
}

// Company Holiday operations
export async function createCompanyHoliday(holidayData: Omit<CompanyHoliday, '_id' | 'createdAt' | 'updatedAt'>): Promise<CompanyHoliday> {
  const db = await getDb();
  const now = new Date();
  const holiday = {
    ...holidayData,
    companyId: new ObjectId(holidayData.companyId),
    createdAt: now,
    updatedAt: now,
  };
  
  console.log("Inserting holiday into database:", holiday);
  
  const result = await db.collection('companyHolidays').insertOne(holiday);
  
  console.log("Holiday inserted with ID:", result.insertedId);
  
  return { ...holiday, _id: result.insertedId.toString(), companyId: holidayData.companyId };
}

export async function findCompanyHolidaysByCompanyId(companyId: string): Promise<CompanyHoliday[]> {
  const db = await getDb();
  const holidays = await db.collection('companyHolidays').find({ companyId }).toArray() as (CompanyHoliday & { _id: ObjectId })[];
  return holidays.map(holiday => ({ ...holiday, _id: holiday._id.toString() }));
}

export async function findCompanyHolidayById(id: string): Promise<CompanyHoliday | null> {
  const db = await getDb();
  const holiday = await db.collection('companyHolidays').findOne({ _id: new ObjectId(id) }) as CompanyHoliday & { _id: ObjectId } | null;
  return holiday ? { ...holiday, _id: holiday._id.toString() } : null;
}

export async function updateCompanyHoliday(id: string, updateData: Partial<CompanyHoliday>): Promise<void> {
  const db = await getDb();
  console.log("Updating holiday in database:", { id, updateData });
  
  const result = await db.collection('companyHolidays').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );
  
  console.log("Update result:", result);
  
  if (result.matchedCount === 0) {
    console.warn("No holiday found with ID:", id);
  }
  
  if (result.modifiedCount === 0) {
    console.warn("No changes made to holiday with ID:", id);
  }
}

export async function deleteCompanyHoliday(id: string): Promise<void> {
  const db = await getDb();
  await db.collection('companyHolidays').deleteOne({ _id: new ObjectId(id) });
}

// Code operations
export async function createCode(
  data: Omit<Code, "_id" | "createdAt" | "updatedAt">
): Promise<Code> {
  const db = await getDb();
  const now = new Date();
  const codeDocument = {
    ...data,
    companyId: new ObjectId(data.companyId),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("codes").insertOne(codeDocument);

  return {
    ...data,
    _id: result.insertedId.toString(),
    createdAt: now,
    updatedAt: now,
  };
}

export async function findCodeByValue(code: string) {
  const db = await getDb();
  const codeDoc = await db.collection('codes').findOne({ code, used: false }) as Code & { _id: ObjectId } | null;
  return codeDoc ? { ...codeDoc, _id: codeDoc._id.toString() } : null;
}

export async function updateCode(id: string, updateData: Partial<Code>): Promise<void> {
  const db = await getDb();
  await db.collection('codes').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );
}

export async function findCodesByCompanyId(companyId: string): Promise<Code[]> {
  const db = await getDb();
  const codes = await db.collection('codes').find({ companyId }).toArray() as (Code & { _id: ObjectId })[];
  return codes.map(code => ({ ...code, _id: code._id.toString() }));
}

// Time Off Request operations
export async function createTimeOffRequest(
  requestData: Omit<TimeOffRequest, "_id" | "createdAt" | "updatedAt">
): Promise<TimeOffRequest> {
  const db = await getDb();
  const now = new Date();
  const request = {
    ...requestData,
    userId: new ObjectId(requestData.userId),
    companyId: new ObjectId(requestData.companyId),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("time_off_requests").insertOne(request);

  const newRequest = (await db
    .collection("time_off_requests")
    .findOne({ _id: result.insertedId })) as (TimeOffRequest & { _id: ObjectId });

  return {
    ...newRequest,
    _id: newRequest._id.toString(),
    userId: newRequest.userId.toString(),
    companyId: newRequest.companyId.toString(),
  };
}

export async function findTimeOffRequestsByEmployeeId(
  employeeId: string
): Promise<TimeOffRequest[]> {
  const db = await getDb();
  const requests = (await db
    .collection("time_off_requests")
    .find({ userId: new ObjectId(employeeId) })
    .toArray()) as (TimeOffRequest & { _id: ObjectId })[];
  return requests.map((request) => ({
    ...request,
    _id: request._id.toString(),
  }));
}

export async function findTimeOffRequestsByCompanyId(
  companyId: string
): Promise<TimeOffRequest[]> {
  const db = await getDb();
  const requests = (await db
    .collection("time_off_requests")
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $match: {
          "employee.companyId": companyId,
        },
      },
    ])
    .toArray()) as (TimeOffRequest & { _id: ObjectId })[];
  return requests.map((request) => ({
    ...request,
    _id: request._id.toString(),
  }));
}

export async function findTimeOffRequestById(
  id: string
): Promise<TimeOffRequest | null> {
  const db = await getDb();
  const request = (await db
    .collection("time_off_requests")
    .findOne({ _id: new ObjectId(id) })) as (TimeOffRequest & {
    _id: ObjectId;
  }) | null;
  return request ? { ...request, _id: request._id.toString() } : null;
}

export async function updateTimeOffRequest(
  requestId: string,
  updateData: Partial<Omit<TimeOffRequest, "_id" | "companyId" | "userId">>
): Promise<TimeOffRequest | null> {
  const db = await getDb();
  const updateFields: Record<string, unknown> = { ...updateData };

  if (updateData.managerId) {
    updateFields.managerId = new ObjectId(updateData.managerId as string);
  }

  const result = await db.collection("time_off_requests").findOneAndUpdate(
    { _id: new ObjectId(requestId) },
    { $set: { ...updateFields, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  return result as TimeOffRequest | null;
}

// User queries by company
export async function findUsersByCompanyId(companyId: string): Promise<User[]> {
  const db = await getDb();
  const users = await db.collection('users').find({ companyId }).toArray() as (User & { _id: ObjectId })[];
  return users.map(user => ({ ...user, _id: user._id.toString() }));
}

export async function countPendingRequests(companyId: string) {
  const db = await getDb();
  return db.collection("time_off_requests").countDocuments({
    companyId: new ObjectId(companyId),
    status: "PENDING",
  });
}

export async function countApprovedRequests(companyId: string) {
  const db = await getDb();
  return db.collection("time_off_requests").countDocuments({
    companyId: new ObjectId(companyId),
    status: "APPROVED",
  });
}

export async function countEmployees(companyId: string) {
  const db = await getDb();
  return db
    .collection("users")
    .countDocuments({ companyId: new ObjectId(companyId) });
}

export async function countActiveInvitationCodes(companyId: string) {
  const db = await getDb();
  return db.collection("codes").countDocuments({ companyId: new ObjectId(companyId), used: false });
}

export async function getRequestsByUserId(userId: string) {
  const db = await getDb();
  console.log(`[db.ts] Fetching requests for userId: ${userId}`);
  const requests = await db
    .collection("time_off_requests")
    .find({ userId: new ObjectId(userId) })
    .toArray();

  console.log(`[db.ts] Found ${requests.length} requests in DB:`, requests);

  const mappedRequests = requests.map((r) => ({
    ...r,
    _id: r._id.toString(),
    userId: r.userId.toString(),
    companyId: r.companyId.toString(),
    managerId: r.managerId ? r.managerId.toString() : undefined,
  })) as unknown as TimeOffRequest[];

  console.log(
    `[db.ts] Returning ${mappedRequests.length} mapped requests.`,
    mappedRequests
  );

  return mappedRequests;
}

export async function getCompanyHolidays(companyId: string): Promise<CompanyHoliday[]> {
  const db = await getDb();
  console.log("Fetching holidays for companyId:", companyId);
  
  const holidaysFromDb = await db.collection("companyHolidays").find({ companyId: new ObjectId(companyId) }).toArray();
  
  console.log("Raw holidays from database:", holidaysFromDb);
  
  const holidays: CompanyHoliday[] = holidaysFromDb.map(holiday => ({
    ...holiday,
    _id: holiday._id.toString(),
    companyId: holiday.companyId.toString(),
    date: new Date(holiday.date),
  })) as unknown as CompanyHoliday[];

  console.log("Processed holidays:", holidays);

  return holidays;
}

export async function getRequestsByCompanyId(companyId: string) {
  const db = await getDb();
  return db.collection("time_off_requests").find({ companyId: new ObjectId(companyId) }).sort({ createdAt: -1 }).toArray();
}

export async function getDetailedRequestsByCompanyId(companyId: string) {
  const db = await getDb();
  const requests = await db
    .collection("time_off_requests")
    .aggregate([
      { $match: { companyId: new ObjectId(companyId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "managerId",
          foreignField: "_id",
          as: "manager",
        },
      },
      { $unwind: "$employee" },
      {
        $unwind: {
          path: "$manager",
          preserveNullAndEmptyArrays: true,
        },
      },
    ])
    .toArray();

  return requests.map((r: Record<string, unknown>) => ({
    ...r,
    _id: (r._id as ObjectId).toString(),
    userId: (r.userId as ObjectId).toString(),
    companyId: (r.companyId as ObjectId).toString(),
    managerId: r.managerId ? (r.managerId as ObjectId).toString() : undefined,
    employee: {
      ...(r.employee as Record<string, unknown>),
      _id: ((r.employee as Record<string, unknown>)._id as ObjectId).toString(),
      companyId: ((r.employee as Record<string, unknown>).companyId as ObjectId).toString(),
    },
    manager: r.manager
      ? {
          ...(r.manager as Record<string, unknown>),
          _id: ((r.manager as Record<string, unknown>)._id as ObjectId).toString(),
          companyId: ((r.manager as Record<string, unknown>).companyId as ObjectId).toString(),
        }
      : undefined,
  }));
}

export async function getDetailedRequestById(requestId: string) {
  const db = await getDb();
  const requests = await db
    .collection("time_off_requests")
    .aggregate([
      { $match: { _id: new ObjectId(requestId) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "managerId",
          foreignField: "_id",
          as: "manager",
        },
      },
      { $unwind: "$employee" },
      {
        $unwind: {
          path: "$manager",
          preserveNullAndEmptyArrays: true,
        },
      },
    ])
    .toArray();

  const request = requests[0] as Record<string, unknown>;
  if (!request) return null;

  return {
    ...request,
    _id: (request._id as ObjectId).toString(),
    userId: (request.userId as ObjectId).toString(),
    companyId: (request.companyId as ObjectId).toString(),
    managerId: request.managerId ? (request.managerId as ObjectId).toString() : undefined,
    startDate: new Date(request.startDate as string),
    endDate: new Date(request.endDate as string),
    createdAt: new Date(request.createdAt as string),
    updatedAt: new Date(request.updatedAt as string),
    employee: {
      ...(request.employee as Record<string, unknown>),
      _id: ((request.employee as Record<string, unknown>)._id as ObjectId).toString(),
      companyId: ((request.employee as Record<string, unknown>).companyId as ObjectId).toString(),
    },
    manager: request.manager
      ? {
          ...(request.manager as Record<string, unknown>),
          _id: ((request.manager as Record<string, unknown>)._id as ObjectId).toString(),
          companyId: ((request.manager as Record<string, unknown>).companyId as ObjectId).toString(),
        }
      : undefined,
  };
}

export async function getEmployeesByCompanyId(companyId: string): Promise<User[]> {
  const db = await getDb();
  const users = await db
    .collection("users")
    .find({ companyId: new ObjectId(companyId) })
    .toArray();
  return users.map((user) => ({ 
    ...user, 
    _id: user._id.toString(), 
    companyId: user.companyId ? user.companyId.toString() : undefined 
  })) as User[];
}

export async function getInvitationCodesByCompanyId(companyId: string) {
  const db = await getDb();
  const codes = await db
    .collection("codes")
    .find({ companyId: new ObjectId(companyId) })
    .sort({ createdAt: -1 })
    .toArray();

  return codes.map((code) => ({
    _id: code._id.toString(),
    code: code.code,
    used: code.used,
    createdAt: code.createdAt instanceof Date ? code.createdAt.toISOString() : new Date(code.createdAt).toISOString(),
    companyId: code.companyId.toString(),
  }));
}

export async function getCompanyById(
  companyId: string
): Promise<Company | null> {
  const db = await getDb();
  const company = await db.collection('companies').findOne({ _id: new ObjectId(companyId) }) as Company & { _id: ObjectId } | null;
  return company ? { ...company, _id: company._id.toString() } : null;
}