
'use client';

import * as React from 'react';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
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

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = React.useState<User | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast();

  const usersCollectionRef = collection(db, 'Users');

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(usersCollectionRef, orderBy('registrationDate', 'desc'));
      const data = await getDocs(q);
      const fetchedUsers: User[] = data.docs.map((doc) => {
        const docData = doc.data();
        let registrationDateString = new Date().toISOString().split('T')[0]; // Default or fallback
        
        if (docData.registrationDate instanceof Timestamp) {
          registrationDateString = docData.registrationDate.toDate().toISOString().split('T')[0];
        } else if (typeof docData.registrationDate === 'string') {
           registrationDateString = docData.registrationDate;
        } else if (docData.registrationDate?.seconds) { 
          registrationDateString = new Timestamp(docData.registrationDate.seconds, docData.registrationDate.nanoseconds).toDate().toISOString().split('T')[0];
        }

        return {
          id: doc.id,
          name: docData.name,
          email: docData.email,
          registrationDate: registrationDateString,
          surveyCount: docData.surveyCount || 0,
          documentCount: docData.documentCount || 0,
        } as User;
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
      toast({
        title: "Error Fetching Users",
        description: "Could not load user data from the database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, usersCollectionRef]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenRegisterDialog = () => {
    setIsRegisterDialogOpen(true);
  };

  const handleOpenDetailsDialog = (user: User) => {
    setSelectedUserForDetails(user);
    setIsDetailsDialogOpen(true);
  };

  const handleRegisterUserSubmit = async (data: UserRegistrationFormData) => {
    setIsLoading(true);
    try {
      const newUserFirestoreData = {
        name: data.name,
        email: data.email,
        registrationDate: serverTimestamp(), // Firestore will convert this to a Timestamp
        surveyCount: 0,
        documentCount: 0,
      };
      await addDoc(usersCollectionRef, newUserFirestoreData);
      toast({ title: "User Registered", description: `${data.name} has been registered successfully.` });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error registering user: ", error);
      toast({
        title: "Error Registering User",
        description: "Could not save user data to the database.",
        variant: "destructive",
      });
    } finally {
      setIsRegisterDialogOpen(false);
      setIsLoading(false);
    }
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
          {isLoading ? (
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
          {!isLoading && filteredUsers.length === 0 && (
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
