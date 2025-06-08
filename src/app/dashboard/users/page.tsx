import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

// Mock data - replace with actual data fetching
const mockUsers = [
  { id: "u1", name: "User One", email: "user1@example.com", registrationDate: "2023-05-01", surveyCount: 2, documentCount: 3 },
  { id: "u2", name: "User Two", email: "user2@example.com", registrationDate: "2023-05-15", surveyCount: 0, documentCount: 1 },
  { id: "u3", name: "User Three", email: "user3@example.com", registrationDate: "2023-06-01", surveyCount: 5, documentCount: 0 },
];

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Register new users and view existing user data."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Register New User
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Browse and manage all end-users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for DataTable and Filters */}
          <div className="mb-4 flex items-center justify-between">
            <input type="text" placeholder="Filter users..." className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Registration Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Surveys</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Documents</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {mockUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.registrationDate}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.surveyCount}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.documentCount}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Button variant="ghost" size="sm">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mockUsers.length === 0 && <p className="py-4 text-center text-muted-foreground">No users found.</p>}
          {/* Placeholder for Pagination */}
          <div className="mt-4 flex justify-end">
            {/* <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="ml-2">Next</Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
