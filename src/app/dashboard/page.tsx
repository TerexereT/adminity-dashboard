
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldAlert, BarChart3, FileText } from "lucide-react";
import Link from "next/link";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function getCollectionCount(collectionName: string): Promise<number | string> {
  try {
    const collRef = collection(db, collectionName);
    const snapshot = await getCountFromServer(collRef);
    return snapshot.data().count;
  } catch (error) {
    console.error(`Error fetching count for ${collectionName}:`, error);
    return "N/A"; // Return "N/A" or 0 in case of an error
  }
}

export default async function DashboardPage() {
  const usersCount = await getCollectionCount("Users");
  const adminsCount = await getCollectionCount("Admins");
  const surveysCount = await getCollectionCount("SurveyResponses");
  // Assuming 'general_info' is the primary collection for documents count on dashboard
  const documentsCount = await getCollectionCount("general_info"); 

  const stats = [
    { title: "Total Users", value: usersCount, icon: Users, href: "/dashboard/users", description: "Manage all registered users." },
    { title: "Admin Accounts", value: adminsCount, icon: ShieldAlert, href: "/dashboard/admins", description: "Oversee admin personnel." },
    { title: "Survey Responses", value: surveysCount, icon: BarChart3, href: "/dashboard/surveys", description: "View and analyze surveys." },
    { title: "Knowledge Base Documents", value: documentsCount, icon: FileText, href: "/dashboard/documents", description: "Access general documents." },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link 
            href={stat.href} 
            key={stat.title} 
            className="block hover:shadow-lg transition-shadow duration-200 rounded-lg"
          >
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

