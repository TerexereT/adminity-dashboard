
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminFormSchema, type AdminFormData } from '@/lib/schemas';
import type { Admin } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdminFormData) => void;
  adminToEdit?: Admin | null;
}

export function AdminFormDialog({ open, onOpenChange, onSubmit, adminToEdit }: AdminFormDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditing = !!adminToEdit;

  const form = useForm<AdminFormData>({
    resolver: zodResolver(AdminFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'admin',
      password: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      if (isEditing && adminToEdit) {
        form.reset({
          name: adminToEdit.name,
          email: adminToEdit.email,
          role: adminToEdit.role,
          password: '', // Password fields are cleared for editing
          confirmPassword: '',
        });
      } else {
        form.reset({ // Default values for new admin
          name: '',
          email: '',
          role: 'admin',
          password: '',
          confirmPassword: '',
        });
      }
    }
  }, [open, isEditing, adminToEdit, form]);

  const handleSubmit = async (data: AdminFormData) => {
    setIsLoading(true);
    // In a real app, you'd perform an async operation here
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const submitData: AdminFormData = { ...data };
    if (isEditing && !data.password) {
      // If editing and password is not changed, don't send password fields
      delete submitData.password;
      delete submitData.confirmPassword;
    }
    
    onSubmit(submitData);
    setIsLoading(false);
    // Dialog will be closed by parent component's onOpenChange
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Admin' : 'Add New Admin'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modify the details of the administrator.' : 'Fill in the form to add a new administrator.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={isEditing ? "Leave blank to keep current" : "••••••••"} {...field} />
                  </FormControl>
                  {!isEditing && <FormDescription>Must be at least 8 characters.</FormDescription>}
                  {isEditing && <FormDescription>Leave blank if you do not want to change the password.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Add Admin'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
