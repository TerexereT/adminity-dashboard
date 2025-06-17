
'use client'; // Required for useState, useEffect if fetching data client-side

import * as React from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, FileText, Image as ImageIcon, FileType2, Loader2 } from "lucide-react";
import type { UserDocument } from '@/lib/types'; // Assuming UserDocument type exists
import { useToast } from '@/hooks/use-toast';

// Mock data removed, replace with actual data fetching
// const mockDocuments = [ ... ];

const getFileIcon = (fileType?: string) => { // Make fileType optional or provide a default
  switch (fileType?.toUpperCase()) {
    case 'PDF':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'DOCX':
      return <FileType2 className="h-5 w-5 text-blue-500" />;
    case 'PNG':
    case 'JPG':
    case 'JPEG':
      return <ImageIcon className="h-5 w-5 text-green-500" />;
    default:
      return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function DocumentManagementPage() {
  const [documents, setDocuments] = React.useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast();

  // Placeholder for fetching documents - implement this with Firestore
  React.useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, fetch from Firestore here and setDocuments
      // For now, it will remain empty
      setDocuments([]); 
      setIsLoading(false);
      // Example error toast if fetching failed:
      // toast({ title: "Error", description: "Could not fetch documents.", variant: "destructive" });
    };
    fetchDocuments();
  }, [toast]);

  const filteredDocuments = documents.filter(doc =>
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Management"
        description="Access and manage user-uploaded documents securely."
      />

      <Card>
        <CardHeader>
          <CardTitle>Filter Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="Filter by User ID, Name or File Name..." 
            className="max-w-md" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Document List</CardTitle>
          <CardDescription>Browse and download user documents.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading documents...</p>
            </div>
          ) : (
           <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Upload Date</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground flex items-center">
                      {getFileIcon(doc.fileType)}
                      <span className="ml-2">{doc.fileName}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{doc.userName || 'N/A'} (ID: {doc.userId})</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{doc.fileType}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{doc.uploadDate}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} download={doc.fileName}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          {!isLoading && filteredDocuments.length === 0 && (
             <p className="py-4 text-center text-muted-foreground">
                {documents.length === 0 ? 'No documents found in the system.' : 'No documents match your filter.'}
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
