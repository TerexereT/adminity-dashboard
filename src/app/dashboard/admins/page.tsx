import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

// Mock data - replace with actual data fetching
const mockAdmins = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", role: "superadmin", createdAt: "2023-01-15" },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", role: "admin", createdAt: "2023-02-20" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "admin", createdAt: "2023-03-10" },
];


export default function AdminManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Management"
        description="Manage administrator accounts and their permissions."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Admin
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Administrator List</CardTitle>
          <CardDescription>View and manage all admin accounts in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for DataTable */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Created At</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {mockAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{admin.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{admin.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.role === 'superadmin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{admin.createdAt}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mockAdmins.length === 0 && <p className="py-4 text-center text-muted-foreground">No admins found.</p>}
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
