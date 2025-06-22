import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { getEmployeesByCompanyId } from "@/lib/db";
import AllowanceForm from "@/components/AllowanceForm";

const AllowancePage = async () => {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN" || !user.companyId) {
    redirect("/login");
  }

  const employees = await getEmployeesByCompanyId(user.companyId);

  return (
    <div className="space-y-8 mt-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Holiday allowance management</h1>
          <p className="text-gray-500">Manage employee holiday allowances</p>
        </div>
        <Card>
          <CardContent className="p-6">
            {!employees || employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-gray-500">No employees found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Available Days</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee._id.toHexString()}>
                        <TableCell>
                          {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.department || "N/A"}</TableCell>
                        <TableCell className="capitalize">
                          {employee.role.toLowerCase()}
                        </TableCell>
                        <TableCell>{employee.availableDays}</TableCell>
                        <TableCell>
                          <AllowanceForm
                            employeeId={employee._id.toHexString()}
                            employeeName={`${employee.firstName} ${employee.lastName}`}
                            currentAllowance={employee.availableDays}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AllowancePage;
