
'use client';

import * as React from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  orderBy, // Added for constraints
  type DocumentData, // Added for transform
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Eye, Loader2 } from "lucide-react";
import type { User } from '@/lib/types';
import type { UserRegistrationFormData } from '@/lib/schemas';
import { UserRegistrationDialog } from '@/components/user/user-registration-dialog';
import { UserDetailsDialog } from '@/components/user/user-details-dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'; // Import the hook

export default function UserManagementPage() {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = React.useState<User | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For form submission loading state
  const { toast } = useToast();

  const transformUser = React.useCallback((id: string, data: DocumentData): User => {
    let registrationDateString = new Date().toISOString().split('T')[0]; // Default
    if (data.registrationDate instanceof Timestamp) {
      registrationDateString = data.registrationDate.toDate().toISOString().split('T')[0];
    } else if (typeof data.registrationDate === 'string') {
      registrationDateString = data.registrationDate;
    } else if (data.registrationDate?.seconds && typeof data.registrationDate.seconds === 'number') {
      registrationDateString = new Timestamp(data.registrationDate.seconds, data.registrationDate.nanoseconds || 0).toDate().toISOString().split('T')[0];
    }
    return {
      id,
      name: data.name || 'N/A',
      email: data.email || 'N/A',
      registrationDate: registrationDateString,
      surveyCount: data.surveyCount || 0,
      documentCount: data.documentCount || 0,
    } as User;
  }, []);

  const userConstraints = React.useMemo(() => [orderBy('registrationDate', 'desc')], []);

  const { data: users, isLoading: isLoadingUsers, error: fetchUsersError } = useFirestoreCollection<User>({
    collectionName: 'Users',
    constraints: userConstraints,
    transform: transformUser,
  });

  const handleOpenRegisterDialog = () => {
    setIsRegisterDialogOpen(true);
  };

  const handleOpenDetailsDialog = (user: User) => {
    setSelectedUserForDetails(user);
    setIsDetailsDialogOpen(true);
  };

  const handleRegisterUserSubmit = async (data: UserRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const newUserFirestoreData = {
        name: data.name,
        email: data.email,
        registrationDate: serverTimestamp(),
        surveyCount: 0,
        documentCount: 0,
      };
      await addDoc(collection(db, 'Users'), newUserFirestoreData);
      toast({ title: "User Registered", description: `${data.name} has been registered successfully.` });
      // No need to manually refetch, onSnapshot handles it.
    } catch (error) {
      console.error("Error registering user: ", error);
      toast({
        title: "Error Registering User",
        description: "Could not save user data to the database.",
        variant: "destructive",
      });
    } finally {
      setIsRegisterDialogOpen(false);
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (fetchUsersError) {
     return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-destructive">Error loading users: {fetchUsersError.message}</p>
        <p className="text-muted-foreground">Please try refreshing the page or contact support.</p>
      </div>
    );
  }

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
          {isLoadingUsers ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading users...</p>
            </div>
          ) : (
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
          )}
          {!isLoadingUsers && filteredUsers.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">
              {users.length === 0 ? 'No users found. Register one to get started.' : 'No users match your filter.'}
            </p>
          )}
        </CardContent>
      </Card>

      <UserRegistrationDialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
        onSubmit={handleRegisterUserSubmit}
        // Pass isSubmitting if the dialog needs its own loading state control
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
