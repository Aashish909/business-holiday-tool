import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDetailedRequestsByCompanyId } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Table,
  TableHead,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DetailedTimeOffRequest } from "@/lib/types";

const TimeOffRequestsPage = async () => {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN" || !user.companyId) {
    redirect("/login");
  }

  const requests = (await getDetailedRequestsByCompanyId(
    user.companyId
  )) as DetailedTimeOffRequest[];

  return (
    <div className="space-y-8 mt-12">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Time Off Requests</h1>
        <p className="text-gray-500">View and manage all time off requests</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    {request.employee.firstName} {request.employee.lastName}
                  </TableCell>
                  <TableCell>
                    {formatDate(request.startDate)} -{" "}
                    {formatDate(request.endDate)}
                  </TableCell>
                  <TableCell className="capitalize">{request.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "PENDING"
                          ? "secondary"
                          : request.status === "APPROVED"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {request.status.charAt(0) +
                        request.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.manager
                      ? `${request.manager.firstName} ${request.manager.lastName}`
                      : "-"}
                  </TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="link" asChild>
                      <Link
                        href={`/admin/time-off-requests/${request._id}`}
                      >
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeOffRequestsPage;
