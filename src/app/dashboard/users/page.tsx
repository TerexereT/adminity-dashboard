
'use client';

import * as React from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  orderBy, Timestamp, // Added for constraints
  type DocumentData, // Added for transform
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Eye, Loader2 } from "lucide-react";
import type { UserRegistrationFormData } from '@/lib/schemas';
import { UserDetailsDialog } from '@/components/user/user-details-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserRegistrationDialog } from '@/components/user/user-registration-dialog';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'; // Import the hook
import { format } from 'date-fns';

export default function UserManagementPage() {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = React.useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For form submission loading state
  const transformUser = React.useCallback((id: string, data: DocumentData): User => {
    return {
      id: id,
      name: data.name, // Add name as it's in the schema
      email: data.email || undefined,
      phone: data.phone || '', // Ensure phone is always a string
      createdAt: data.createdAt ? Timestamp.fromDate(new Date(data.createdAt)).toString() : '', // Handle potential Timestamp or Date string
      userType: data.userType, // Assuming userType is stored in Firestore
    };
  }, []); // No dependencies needed as it only uses fixed logic and imported types/functions

  const userConstraints = React.useMemo(() => [orderBy('createdAt', 'desc')], []);
 const { data: users, isLoading: isLoadingUsers, error: fetchUsersError } = useFirestoreCollection<User>({
    collectionName: 'Users',
    constraints: userConstraints,
    transform: transformUser,
  });
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');

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
        createdAt: serverTimestamp(),
        email: data.email || null, // Save email, handle optionality
        phone: data.phone, // Save phone
        userType: data.userType, // Save userType
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

  const filteredUsers = users.filter(user => {
    return (
 user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || // Handle optional email
 user.phone.includes(searchTerm))
  });

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
              className="h-10 w-full max-w-sm"
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Created At</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Documents</th>
 <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">User Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.createdAt}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.phone}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
 <Button variant="ghost" size="sm" onClick={() => handleOpenDetailsDialog(user)}>
                          <Eye className="h-4 w-4" />
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

      {/* UserRegistrationDialog */}
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
