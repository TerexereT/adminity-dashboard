
'use client';

import * as React from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SurveyResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'; // Import the hook
import { orderBy, Timestamp, type DocumentData } from 'firebase/firestore'; // Import for constraints

export default function SurveyResponsesPage() {
  const [filterUserIdName, setFilterUserIdName] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const { toast } = useToast(); // Keep toast if needed for other actions

  const transformSurveyResponse = React.useCallback((id: string, data: DocumentData): SurveyResponse => {
    let submissionDateString = new Date().toISOString().split('T')[0]; // Default
    if (data.submissionDate instanceof Timestamp) {
      submissionDateString = data.submissionDate.toDate().toISOString().split('T')[0];
    } else if (typeof data.submissionDate === 'string') {
      submissionDateString = data.submissionDate;
    } else if (data.submissionDate?.seconds && typeof data.submissionDate.seconds === 'number') {
      submissionDateString = new Timestamp(data.submissionDate.seconds, data.submissionDate.nanoseconds || 0).toDate().toISOString().split('T')[0];
    }

    return {
      id,
      userId: data.userId || 'N/A',
      userName: data.userName, // Optional
      type: data.type || 'General',
      submissionDate: submissionDateString,
      data: data.data || {},
    } as SurveyResponse;
  }, []);
  
  // Assuming survey responses should be ordered by submissionDate
  const surveyConstraints = React.useMemo(() => [orderBy('submissionDate', 'desc')], []);

  const { data: surveyResponses, isLoading, error: fetchSurveysError } = useFirestoreCollection<SurveyResponse>({
    collectionName: 'SurveyResponses', // Replace with your actual collection name
    constraints: surveyConstraints,
    transform: transformSurveyResponse,
  });
  
  const filteredResponses = surveyResponses.filter(response => {
    const typeMatch = filterType === 'all' || response.type.toLowerCase() === filterType.toLowerCase();
    const searchMatch = 
      response.userId.toLowerCase().includes(filterUserIdName.toLowerCase()) ||
      (response.userName && response.userName.toLowerCase().includes(filterUserIdName.toLowerCase()));
    return typeMatch && searchMatch;
  });

  if (fetchSurveysError) {
    return (
     <div className="flex flex-col items-center justify-center h-full">
       <p className="text-destructive">Error loading survey responses: {fetchSurveysError.message}</p>
       <p className="text-muted-foreground">Please try refreshing the page or contact support.</p>
     </div>
   );
 }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Survey Responses"
        description="View and analyze submitted survey data."
      />

      <Card>
        <CardHeader>
          <CardTitle>Filter Responses</CardTitle>
          <CardDescription>Use the filters below to narrow down survey responses.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Input 
            placeholder="Filter by User ID or Name..." 
            className="max-w-xs" 
            value={filterUserIdName}
            onChange={(e) => setFilterUserIdName(e.target.value)}
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="onboarding">Onboarding</SelectItem>
              <SelectItem value="exit">Exit Survey</SelectItem>
            </SelectContent>
          </Select>
           <Input type="text" placeholder="Date Range (placeholder)" className="w-full md:w-auto disabled:opacity-50" disabled />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading survey responses...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResponses.length > 0 ? (
            filteredResponses.map((response) => (
              <Card key={response.id}>
                <CardHeader>
                  <CardTitle className="text-lg font-headline">Survey: {response.type} - {response.userName || 'N/A'}</CardTitle>
                  <CardDescription>Submitted on: {response.submissionDate} by User ID: {response.userId}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-code shadow-inner">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {surveyResponses.length === 0 ? 'No survey responses found. Ensure "SurveyResponses" collection exists.' : 'No survey responses match the current filters.'}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
