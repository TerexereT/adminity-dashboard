
'use client';

import * as React from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  onSnapshot, // Added for real-time updates
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import type { Admin } from '@/lib/types';
import type { AdminFormData } from '@/lib/schemas';
import { AdminFormDialog } from '@/components/admin/admin-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import bcrypt from 'bcryptjs';

// Define adminsCollectionRef at the module level for a stable reference
const adminsCollectionRef = collection(db, 'Admins');

export default function AdminManagementPage() {
  const [admins, setAdmins] = React.useState<Admin[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [adminToEdit, setAdminToEdit] = React.useState<Admin | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [adminToDelete, setAdminToDelete] = React.useState<Admin | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsLoading(true);
    const q = query(adminsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAdmins: Admin[] = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        let createdAtString = new Date().toISOString().split('T')[0]; // Default or fallback
        if (docData.createdAt instanceof Timestamp) {
          createdAtString = docData.createdAt.toDate().toISOString().split('T')[0];
        } else if (typeof docData.createdAt === 'string') {
           createdAtString = docData.createdAt;
        } else if (docData.createdAt?.seconds) { // Handle object with seconds/nanoseconds
          createdAtString = new Timestamp(docData.createdAt.seconds, docData.createdAt.nanoseconds).toDate().toISOString().split('T')[0];
        }

        return {
          id: doc.id,
          name: docData.name,
          email: docData.email,
          role: docData.role,
          createdAt: createdAtString,
          passwordHash: docData.passwordHash,
        } as Admin;
      });
      setAdmins(fetchedAdmins);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching admins with onSnapshot: ", error);
      toast({
        title: "Error Fetching Admins",
        description: "Could not load administrator data from the database in real-time.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    // Cleanup function to unsubscribe when the component unmounts
    return () => unsubscribe();
  }, [toast]); // toast is a stable dependency from useToast

  const handleOpenAddDialog = () => {
    setAdminToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (admin: Admin) => {
    setAdminToEdit(admin);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleAdminFormSubmit = async (data: AdminFormData) => {
    // Form dialog has its own loading state, this page's isLoading is for the list
    try {
      const saltRounds = 10;
      if (adminToEdit) {
        const adminDocRef = doc(db, 'Admins', adminToEdit.id);
        const updateData: Partial<Omit<Admin, 'id' | 'createdAt'>> = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        if (data.password) {
          const hashedPassword = await bcrypt.hash(data.password, saltRounds);
          updateData.passwordHash = hashedPassword;
        }
        await updateDoc(adminDocRef, updateData);
        toast({ title: "Admin Updated", description: `${data.name} has been updated successfully.` });
      } else {
        if (!data.password) {
          toast({ title: "Error", description: "Password is required for new admins.", variant: "destructive" });
          return;
        }
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        const newAdminData: Omit<Admin, 'id' | 'createdAt'> & { createdAt: any } = {
          name: data.name,
          email: data.email,
          role: data.role,
          passwordHash: hashedPassword,
          createdAt: serverTimestamp(), 
        };
        await addDoc(adminsCollectionRef, newAdminData);
        toast({ title: "Admin Added", description: `${data.name} has been added successfully.` });
      }
      // No need to call fetchAdmins(); onSnapshot will update the list.
    } catch (error) {
      console.error("Error saving admin: ", error);
      toast({
        title: "Error Saving Admin",
        description: "Could not save administrator data to the database.",
        variant: "destructive",
      });
    } finally {
      setIsFormDialogOpen(false);
      setAdminToEdit(null);
    }
  };

  const confirmDeleteAdmin = async () => {
    if (adminToDelete) {
      try {
        const adminDocRef = doc(db, 'Admins', adminToDelete.id);
        await deleteDoc(adminDocRef);
        toast({ title: "Admin Deleted", description: `${adminToDelete.name} has been deleted.`, variant: "destructive" });
        // No need to call fetchAdmins(); onSnapshot will update the list.
      } catch (error) {
        console.error("Error deleting admin: ", error);
        toast({
          title: "Error Deleting Admin",
          description: "Could not delete administrator data from the database.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setAdminToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Management"
        description="Manage administrator accounts and their permissions."
      >
        <Button onClick={handleOpenAddDialog}>
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
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading admins...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Created At</th>
                    <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {admins.map((admin) => (
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
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(admin)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90" onClick={() => handleOpenDeleteDialog(admin)}>
                           <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && admins.length === 0 && <p className="py-4 text-center text-muted-foreground">No admins found. Add one to get started.</p>}
        </CardContent>
      </Card>

      <AdminFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSubmit={handleAdminFormSubmit}
        adminToEdit={adminToEdit}
      />

      {adminToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the admin account for 
                <span className="font-semibold"> {adminToDelete.name}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAdminToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAdmin} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Yes, delete admin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
