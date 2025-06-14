
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
  passwordHash?: string; // Added for conceptual clarity, though not directly used with mock data
};

export type User = {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  surveyCount: number;
  documentCount: number;
};

export type SurveyResponse = {
  id: string;
  userId: string;
  userName?: string; 
  type: string;
  submissionDate: string;
  data: Record<string, any>;
};

export type UserDocument = {
  id: string;
  userId: string;
  userName?: string;
  fileName: string;
  fileType: 'PDF' | 'DOCX' | 'PNG' | 'JPG' | 'JPEG';
  uploadDate: string;
  url: string; // This would be a secure, temporary URL in a real app
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

