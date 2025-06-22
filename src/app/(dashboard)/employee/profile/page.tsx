import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findUserById, getCompanyById, getCompanyHolidays } from "@/lib/db";
import EmployeeProfileForm from "@/components/EmployeeProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Building, User, Mail, MapPin, Clock } from "lucide-react";

const EmployeeProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [dbUser, company, companyHolidays] = await Promise.all([
    findUserById(user.userId),
    findUserById(user.userId).then(user => user?.companyId ? getCompanyById(user.companyId) : null),
    findUserById(user.userId).then(user => user?.companyId ? getCompanyHolidays(user.companyId) : [])
  ]);

  if (!dbUser) {
    redirect("/login");
  }

  const workingDays = company?.workingDays || [];

  return (
    <div className="space-y-8 mt-12">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-500">View and edit your profile information and company details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Employee Profile Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeProfileForm initialUser={dbUser} />
            </CardContent>
          </Card>

          {/* Employee Stats */}
          <Card>
            <CardHeader>
              <CardTitle>My Statistics</CardTitle>
              <CardDescription>Your time off and work information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{dbUser.availableDays}</div>
                  <div className="text-sm text-gray-600">Available Days</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{dbUser.role}</div>
                  <div className="text-sm text-gray-600">Role</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{dbUser.department || "N/A"}</div>
                  <div className="text-sm text-gray-600">Department</div>
                </div>
                <div className="rounded-lg bg-orange-50 p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {format(new Date(dbUser.createdAt), "MMM yyyy")}
                  </div>
                  <div className="text-sm text-gray-600">Joined</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Information Section */}
        <div className="space-y-6">
          {company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Details about your company</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {company.logo ? (
                      <img src={company.logo} alt="Company Logo" className="w-8 h-8 rounded" />
                    ) : (
                      <Building className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    {company.website && (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {company.website}
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{dbUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Role:</span>
                    <Badge variant="outline" className="capitalize">{dbUser.role.toLowerCase()}</Badge>
                  </div>
                  {dbUser.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{dbUser.department}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Working Days */}
          {workingDays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Working Days
                </CardTitle>
                <CardDescription>Your company&apos;s working schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {workingDays.map((day) => (
                    <Badge key={day} variant="secondary" className="capitalize">
                      {day}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Holidays */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Company Holidays
              </CardTitle>
              <CardDescription>Upcoming and recurring company holidays</CardDescription>
            </CardHeader>
            <CardContent>
              {companyHolidays.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No company holidays configured yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyHolidays
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5) // Show only next 5 holidays
                    .map((holiday) => (
                      <div key={holiday._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{holiday.name}</h4>
                          <p className="text-sm text-gray-600">
                            {format(new Date(holiday.date), "EEEE, MMMM d, yyyy")}
                          </p>
                        </div>
                        {holiday.isRecurring && (
                          <Badge variant="secondary" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                      </div>
                    ))}
                  {companyHolidays.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{companyHolidays.length - 5} more holidays
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage; 