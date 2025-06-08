import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/shared/date-range-picker"; // Assume this component exists or will be created

// Mock data - replace with actual data fetching
const mockSurveyResponses = [
  { id: "s1", userId: "u1", userName: "User One", type: "Feedback", submissionDate: "2023-06-10", data: { rating: 5, comment: "Great service!" } },
  { id: "s2", userId: "u2", userName: "User Two", type: "Onboarding", submissionDate: "2023-06-12", data: { experience: "smooth", suggestions: "None" } },
  { id: "s3", userId: "u1", userName: "User One", type: "Feedback", submissionDate: "2023-06-15", data: { rating: 4, comment: "Good, but could improve X." } },
];

export default function SurveyResponsesPage() {
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
          <Input placeholder="Filter by User ID or Name..." className="max-w-xs" />
          <Select>
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
          {/* <DatePickerWithRange className="w-full md:w-auto" /> Placeholder - This component needs to be implemented */}
           <Input type="text" placeholder="Date Range (placeholder)" className="w-full md:w-auto" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {mockSurveyResponses.map((response) => (
          <Card key={response.id}>
            <CardHeader>
              <CardTitle className="text-lg font-headline">Survey: {response.type} - {response.userName}</CardTitle>
              <CardDescription>Submitted on: {response.submissionDate} by User ID: {response.userId}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-code shadow-inner">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
        {mockSurveyResponses.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No survey responses match the current filters.
            </CardContent>
          </Card>
        )}
      </div>
      {/* Placeholder for Pagination */}
    </div>
  );
}
