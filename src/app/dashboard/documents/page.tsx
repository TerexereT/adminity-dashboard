
'use client';

import * as React from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, FileText, Link as LinkIcon, Loader2 } from "lucide-react";
import type { AppDocument } from '@/lib/types'; // Updated type
import { useToast } from '@/hooks/use-toast';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection';
import { orderBy, Timestamp, type DocumentData } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

// Simplified generic file icon
const getFileIcon = (_doc: AppDocument) => {
  return <FileText className="h-5 w-5 text-muted-foreground" />;
};

const documentBases = [
  { value: 'general_info', label: 'General Information' },
  // Add other document bases (collections) here in the future
  // { value: 'UserDocuments', label: 'User Uploads' },
];

export default function DocumentManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCollection, setSelectedCollection] = React.useState<string>(documentBases[0].value);
  const { toast } = useToast();

  const transformDocument = React.useCallback((id: string, data: DocumentData): AppDocument => {
    let updatedAtString = new Date().toISOString().split('T')[0];
    if (data.updatedAt instanceof Timestamp) {
      updatedAtString = data.updatedAt.toDate().toISOString().split('T')[0];
    } else if (typeof data.updatedAt === 'string') {
      updatedAtString = data.updatedAt;
    } else if (data.updatedAt?.seconds && typeof data.updatedAt.seconds === 'number') {
      updatedAtString = new Timestamp(data.updatedAt.seconds, data.updatedAt.nanoseconds || 0).toDate().toISOString().split('T')[0];
    } else if (data.uploadDate instanceof Timestamp) { // Fallback for older UserDocuments structure
        updatedAtString = data.uploadDate.toDate().toISOString().split('T')[0];
    }


    return {
      id,
      title: data.title || data.fileName || 'Untitled', // Fallback to fileName for UserDocuments
      url: data.url || '#',
      accessLevel: data.accessLevel || 'N/A',
      status: data.status || 'N/A',
      tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()) : []),
      updatedAt: updatedAtString,
      // Include UserDocuments specific fields if needed, and if `selectedCollection` logic is expanded
      userId: data.userId,
      userName: data.userName,
      fileType: data.fileType,
    } as AppDocument;
  }, []);

  const documentConstraints = React.useMemo(() => [orderBy('updatedAt', 'desc')], []);

  const { data: documents, isLoading, error: fetchDocumentsError } = useFirestoreCollection<AppDocument>({
    collectionName: selectedCollection,
    constraints: documentConstraints,
    transform: transformDocument,
  });

  const filteredDocuments = documents.filter(doc => {
    const searchTermLower = searchTerm.toLowerCase();
    const titleMatch = doc.title.toLowerCase().includes(searchTermLower);
    const tagsMatch = doc.tags.some(tag => tag.toLowerCase().includes(searchTermLower));
    // Keep previous UserDocuments specific search if needed, can be conditional on selectedCollection
    // const userNameMatch = doc.userName && doc.userName.toLowerCase().includes(searchTermLower);
    // const userIdMatch = doc.userId && doc.userId.toLowerCase().includes(searchTermLower);
    return titleMatch || tagsMatch;
  });

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
        description="Access and manage documents securely."
      />

      <Card>
        <CardHeader>
          <CardTitle>Filter & Select Document Base</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select Document Base" />
            </SelectTrigger>
            <SelectContent>
              {documentBases.map(base => (
                <SelectItem key={base.value} value={base.value}>{base.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Filter by Title or Tags..."
            className="max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document List: {documentBases.find(db => db.value === selectedCollection)?.label}</CardTitle>
          <CardDescription>Browse and access documents.</CardDescription>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground w-[40%]">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Access Level</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tags</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Updated At</th>
                  <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground flex items-center">
                      {getFileIcon(doc)}
                      <span className="ml-2 truncate" title={doc.title}>{doc.title}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{doc.accessLevel}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                      <Badge variant={doc.status === 'published' ? 'default' : 'secondary'}>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-1 w-48">
                        {doc.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="truncate">{tag}</Badge>
                        ))}
                        {doc.tags.length > 3 && <Badge variant="outline">...</Badge>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{doc.updatedAt}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                      {doc.url && doc.url !== '#' && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            View
                          </a>
                        </Button>
                      )}
                      {/* For UserDocuments, a download button might be more appropriate if URL is for direct download */}
                       {selectedCollection === 'UserDocuments' && doc.url && doc.url !== '#' && (
                         <Button variant="ghost" size="sm" asChild>
                           <a href={doc.url} download={doc.title}>
                             <Download className="mr-2 h-4 w-4" />
                             Download
                           </a>
                         </Button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          {!isLoading && filteredDocuments.length === 0 && (
             <p className="py-4 text-center text-muted-foreground">
                {documents.length === 0 ? `No documents found in the "${selectedCollection}" collection. Ensure it exists and contains data.` : 'No documents match your filter.'}
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
