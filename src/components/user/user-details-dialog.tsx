
'use client';

import * as React from 'react';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDetailsDialog({ open, onOpenChange, user }: UserDetailsDialogProps) {
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details: {user.name}</DialogTitle>
          <DialogDescription>
            Viewing information for user ID: {user.id}
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 items-center gap-x-2">
            <Label htmlFor="userName" className="text-muted-foreground font-semibold">Name:</Label>
            <p id="userName" className="col-span-2 break-words">{user.name}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-x-2">
            <Label htmlFor="userEmail" className="text-muted-foreground font-semibold">Email:</Label>
            <p id="userEmail" className="col-span-2 break-words">{user.email}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-x-2">
            <Label htmlFor="userPhone" className="text-muted-foreground font-semibold">Phone:</Label>
            <p id="userPhone" className="col-span-2 break-words">{user.phone}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-x-2">
            <Label htmlFor="userType" className="text-muted-foreground font-semibold">User Type:</Label>
            <p id="userType" className="col-span-2">{user.userType}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-x-2">
            <Label htmlFor="userCreatedAt" className="text-muted-foreground font-semibold">Registered:</Label>
            <p id="userCreatedAt" className="col-span-2">{user.createdAt}</p>
          </div>
          {/* 
            Fields like surveyCount and documentCount are not part of the base User type.
            If these are needed, they should be added to the User type and fetched/calculated accordingly.
            For now, they are removed to avoid displaying undefined.
          <Separator className="my-2" />
          <div className="grid grid-cols-3 items-center gap-x-2">
            <Label htmlFor="userSurveys" className="text-muted-foreground font-semibold">Surveys:</Label>
            <p id="userSurveys" className="col-span-2">{user.surveyCount}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-x-2">
            <Label htmlFor="userDocs" className="text-muted-foreground font-semibold">Documents:</Label>
            <p id="userDocs" className="col-span-2">{user.documentCount}</p>
          </div> 
          */}
        </div>
        <Separator className="my-4" />
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
