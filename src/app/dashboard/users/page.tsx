
'use client';

import * as React from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Eye } from "lucide-react";
import type { User } from '@/lib/types';
import type { UserRegistrationFormData } from '@/lib/schemas';
import { UserRegistrationDialog } from '@/components/user/user-registration-dialog';
import { UserDetailsDialog } from '@/components/user/user-details-dialog';
import { useToast } from '@/hooks/use-toast';

const initialMockUsers: User[] = [
  { id: "u1", name: "User One", email: "user1@example.com", registrationDate: "2023-05-01", surveyCount: 2, documentCount: 3 },
  { id: "u2", name: "User Two", email: "user2@example.com", registrationDate: "2023-05-15", surveyCount: 0, documentCount: 1 },
  { id: "u3", name: "User Three", email: "user3@example.com", registrationDate: "2023-06-01", surveyCount: 5, documentCount: 0 },
];

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<User[]>(initialMockUsers);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = React.useState<User | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast();

  const handleOpenRegisterDialog = () => {
    setIsRegisterDialogOpen(true);
  };

  const handleOpenDetailsDialog = (user: User) => {
    setSelectedUserForDetails(user);
    setIsDetailsDialogOpen(true);
  };

  const handleRegisterUserSubmit = (data: UserRegistrationFormData) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      registrationDate: new Date().toISOString().split('T')[0],
      surveyCount: 0,
      documentCount: 0,
    };
    setUsers(prevUsers => [newUser, ...prevUsers]); // Add to the top for visibility
    toast({ title: "User Registered", description: `${newUser.name} has been registered successfully.` });
    setIsRegisterDialogOpen(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Register new users and view existing user data."
      >
        <Button onClick={handleOpenRegisterDialog}>
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
          <div className="mb-4 flex items-center justify-between">
            <Input
              type="text"
              placeholder="Filter users by name or email..."
              className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                  <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.registrationDate}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground text-center">{user.surveyCount}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground text-center">{user.documentCount}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDetailsDialog(user)}>
                        <Eye className="mr-1 h-4 w-4" /> View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">
              {searchTerm ? 'No users match your filter.' : 'No users found.'}
            </p>
          )}
          {/* Placeholder for Pagination */}
          <div className="mt-4 flex justify-end">
            {/* <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="ml-2">Next</Button> */}
          </div>
        </CardContent>
      </Card>

      <UserRegistrationDialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
        onSubmit={handleRegisterUserSubmit}
      />

      {selectedUserForDetails && (
        <UserDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={(open) => {
            setIsDetailsDialogOpen(open);
            if (!open) {
              setSelectedUserForDetails(null); 
            }
          }}
          user={selectedUserForDetails}
        />
      )}
    </div>
  );
}
