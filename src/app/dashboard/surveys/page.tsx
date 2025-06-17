
'use client'; // Required for useState, useEffect if fetching data client-side

import * as React from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/shared/date-range-picker"; // Assume this component exists or will be created
import type { SurveyResponse } from '@/lib/types'; // Assuming SurveyResponse type exists
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Mock data removed - replace with actual data fetching
// const mockSurveyResponses = [ ... ];

export default function SurveyResponsesPage() {
  const [surveyResponses, setSurveyResponses] = React.useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filterUserIdName, setFilterUserIdName] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  // const [dateRange, setDateRange] = React.useState<DateRange | undefined>(); // For DatePickerWithRange
  const { toast } = useToast();

  // Placeholder for fetching survey responses - implement this with Firestore
  React.useEffect(() => {
    const fetchSurveyResponses = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, fetch from Firestore here and setSurveyResponses
      // For now, it will remain empty
      setSurveyResponses([]);
      setIsLoading(false);
      // Example error toast if fetching failed:
      // toast({ title: "Error", description: "Could not fetch survey responses.", variant: "destructive" });
    };
    fetchSurveyResponses();
  }, [toast]);
  
  const filteredResponses = surveyResponses.filter(response => {
    const typeMatch = filterType === 'all' || response.type.toLowerCase() === filterType.toLowerCase();
    const searchMatch = 
      response.userId.toLowerCase().includes(filterUserIdName.toLowerCase()) ||
      (response.userName && response.userName.toLowerCase().includes(filterUserIdName.toLowerCase()));
    // Add date range filtering if DatePickerWithRange is implemented
    return typeMatch && searchMatch;
  });


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
              {/* Add more types as needed */}
            </SelectContent>
          </Select>
          {/* 
          <DatePickerWithRange 
            dateRange={dateRange} 
            setDateRange={setDateRange} 
            className="w-full md:w-auto" 
          /> 
          */}
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
          {filteredResponses.map((response) => (
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
          ))}
          {!isLoading && filteredResponses.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {surveyResponses.length === 0 ? 'No survey responses found in the system.' : 'No survey responses match the current filters.'}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
