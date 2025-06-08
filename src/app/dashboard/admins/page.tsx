
'use client';

import * as React from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const initialMockAdmins: Admin[] = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", role: "superadmin", createdAt: "2023-01-15" },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", role: "admin", createdAt: "2023-02-20" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "admin", createdAt: "2023-03-10" },
];

export default function AdminManagementPage() {
  const [admins, setAdmins] = React.useState<Admin[]>(initialMockAdmins);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [adminToEdit, setAdminToEdit] = React.useState<Admin | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [adminToDelete, setAdminToDelete] = React.useState<Admin | null>(null);
  const { toast } = useToast();

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

  const handleAdminFormSubmit = (data: AdminFormData) => {
    if (adminToEdit) {
      // Edit existing admin
      setAdmins(prevAdmins =>
        prevAdmins.map(admin =>
          admin.id === adminToEdit.id ? { ...admin, ...data, passwordHash: data.password ? `hashed_${data.password}` : admin.passwordHash } : admin
        )
      );
      toast({ title: "Admin Updated", description: `${data.name} has been updated successfully.` });
    } else {
      // Add new admin
      const newAdmin: Admin = {
        id: `admin_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date().toISOString().split('T')[0],
        // passwordHash: data.password ? `hashed_${data.password}` : undefined, // In real app, hash password
      };
      setAdmins(prevAdmins => [...prevAdmins, newAdmin]);
      toast({ title: "Admin Added", description: `${newAdmin.name} has been added successfully.` });
    }
    setIsFormDialogOpen(false);
    setAdminToEdit(null);
  };

  const confirmDeleteAdmin = () => {
    if (adminToDelete) {
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== adminToDelete.id));
      toast({ title: "Admin Deleted", description: `${adminToDelete.name} has been deleted.`, variant: "destructive" });
      setIsDeleteDialogOpen(false);
      setAdminToDelete(null);
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
          {admins.length === 0 && <p className="py-4 text-center text-muted-foreground">No admins found.</p>}
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
