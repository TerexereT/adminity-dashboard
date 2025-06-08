import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldAlert, BarChart3, FileText } from "lucide-react";
import { MOCK_ADMINS_COUNT, MOCK_USERS_COUNT, MOCK_SURVEYS_COUNT, MOCK_DOCUMENTS_COUNT } from "@/lib/constants";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { title: "Total Users", value: MOCK_USERS_COUNT, icon: Users, href: "/dashboard/users", description: "Manage all registered users." },
    { title: "Admin Accounts", value: MOCK_ADMINS_COUNT, icon: ShieldAlert, href: "/dashboard/admins", description: "Oversee admin personnel." },
    { title: "Survey Responses", value: MOCK_SURVEYS_COUNT, icon: BarChart3, href: "/dashboard/surveys", description: "View and analyze surveys." },
    { title: "Uploaded Documents", value: MOCK_DOCUMENTS_COUNT, icon: FileText, href: "/dashboard/documents", description: "Access user documents." },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title} legacyBehavior>
            <a className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-body">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-3xl font-bold font-headline">{stat.value}</div>
                  <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>Placeholder for recent system activities or logs.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity to display.</p>
            {/* Placeholder for activity feed */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">System Health</CardTitle>
            <CardDescription>Placeholder for system status indicators.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-sm text-muted-foreground">All systems operational.</p>
             </div>
            {/* Placeholder for system health indicators */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
