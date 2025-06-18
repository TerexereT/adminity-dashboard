
import type { Timestamp } from "firebase/firestore";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon?: React.ElementType;
  matchExact?: boolean;
};

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
  passwordHash: string;
};

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  userType: 0|1|2;
  createdAt: string;
};

export type SurveyResponse = {
  id: string;
  userId: string;
  userName?: string;
  type: string;
  submissionDate: string;
  data: Record<string, any>;
};

// Renamed from UserDocument and fields updated
export type AppDocument = {
  id: string;
  title: string;
  url: string;
  accessLevel: string;
  status: string;
  tags: string[]; // Assuming tags are an array of strings
  updatedAt: string; // For sorting, from Firestore Timestamp
  // Optional fields that might exist in some collections
  userId?: string;
  userName?: string;
  fileType?: string; // Could be used for icons if available
};

// Represents a generic table column definition for the DataTable component
export interface DataTableColumn<TData> {
  accessorKey: keyof TData | string; // Key in data object or custom accessor
  header: React.ReactNode | (({ column }: any) => React.ReactNode); // Header label or render function
  cell?: ({ row }: any) => React.ReactNode; // Custom cell render function
  enableSorting?: boolean;
  enableHiding?: boolean;
  meta?: any; // Additional metadata for the column
}
