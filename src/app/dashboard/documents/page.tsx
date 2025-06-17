
'use client';

import * as React from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, FileText, Image as ImageIcon, FileType2, Loader2 } from "lucide-react";
import type { UserDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'; // Import the hook
import { orderBy, Timestamp, type DocumentData } from 'firebase/firestore'; // Import for constraints

const getFileIcon = (fileType?: string) => {
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
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast(); // Keep toast if needed for other actions

  const transformDocument = React.useCallback((id: string, data: DocumentData): UserDocument => {
    let uploadDateString = new Date().toISOString().split('T')[0]; // Default
    if (data.uploadDate instanceof Timestamp) {
      uploadDateString = data.uploadDate.toDate().toISOString().split('T')[0];
    } else if (typeof data.uploadDate === 'string') {
      uploadDateString = data.uploadDate;
    } else if (data.uploadDate?.seconds && typeof data.uploadDate.seconds === 'number') {
      uploadDateString = new Timestamp(data.uploadDate.seconds, data.uploadDate.nanoseconds || 0).toDate().toISOString().split('T')[0];
    }
    
    return {
      id,
      userId: data.userId || 'N/A',
      userName: data.userName, // Optional, might not be present
      fileName: data.fileName || 'Untitled',
      fileType: data.fileType || 'UNKNOWN', // Ensure fileType is a valid UserDocument['fileType']
      uploadDate: uploadDateString,
      url: data.url || '#', // Placeholder URL
    } as UserDocument;
  }, []);

  // Assuming documents should be ordered by uploadDate, change if needed
  const documentConstraints = React.useMemo(() => [orderBy('uploadDate', 'desc')], []); 

  const { data: documents, isLoading, error: fetchDocumentsError } = useFirestoreCollection<UserDocument>({
    collectionName: 'UserDocuments', // Replace with your actual collection name
    constraints: documentConstraints,
    transform: transformDocument,
  });

  const filteredDocuments = documents.filter(doc =>
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.userName && doc.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    doc.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (fetchDocumentsError) {
    return (
     <div className="flex flex-col items-center justify-center h-full">
       <p className="text-destructive">Error loading documents: {fetchDocumentsError.message}</p>
       <p className="text-muted-foreground">Please try refreshing the page or contact support.</p>
     </div>
   );
 }

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
                {documents.length === 0 ? 'No documents found in the system. Please ensure the collection "UserDocuments" exists and contains data.' : 'No documents match your filter.'}
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
