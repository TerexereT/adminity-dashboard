import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, FileText, Image as ImageIcon, FileType2 } from "lucide-react"; // FileType2 for generic docx

// Mock data - replace with actual data fetching
const mockDocuments = [
  { id: "d1", userId: "u1", userName: "User One", fileName: "contract.pdf", fileType: "PDF", uploadDate: "2023-04-20", url: "#" },
  { id: "d2", userId: "u1", userName: "User One", fileName: "profile_pic.png", fileType: "PNG", uploadDate: "2023-04-22", url: "#" },
  { id: "d3", userId: "u2", userName: "User Two", fileName: "report.docx", fileType: "DOCX", uploadDate: "2023-05-05", url: "#" },
];

const getFileIcon = (fileType: 'PDF' | 'DOCX' | 'PNG' | 'JPG' | 'JPEG') => {
  switch (fileType) {
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
          <Input placeholder="Filter by User ID, Name or File Name..." className="max-w-md" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Document List</CardTitle>
          <CardDescription>Browse and download user documents.</CardDescription>
        </CardHeader>
        <CardContent>
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
                {mockDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground flex items-center">
                      {getFileIcon(doc.fileType)}
                      <span className="ml-2">{doc.fileName}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{doc.userName} (ID: {doc.userId})</td>
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
          {mockDocuments.length === 0 && <p className="py-4 text-center text-muted-foreground">No documents found.</p>}
          {/* Placeholder for Pagination */}
        </CardContent>
      </Card>
    </div>
  );
}
