
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProcessDocumentSchema, type ProcessDocumentFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ExternalLink } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface ProcessDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onError: (errorMessage: string) => void;
}

// Helper to check if a string is a valid URL (more robust than simple regex)
const isValidHttpUrl = (string: string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function ProcessDocumentDialog({ open, onOpenChange, onSuccess, onError }: ProcessDocumentDialogProps) {
  const [submissionStatus, setSubmissionStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiResponse, setApiResponse] = React.useState<any | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const webhookUrl = "https://g3nia.app.n8n.cloud/webhook-test/process-document";

  const form = useForm<ProcessDocumentFormData>({
    resolver: zodResolver(ProcessDocumentSchema),
    defaultValues: {
      url: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ url: '' });
      setSubmissionStatus('idle');
      setApiResponse(null);
      setErrorMessage(null);
    }
  }, [open, form]);

  const handleSubmit = async (data: ProcessDocumentFormData) => {
    setSubmissionStatus('loading');
    setApiResponse(null);
    setErrorMessage(null);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.url }),
      });

      const responseData = await response.text(); // Get raw text first

      if (!response.ok) {
        // Try to parse as JSON for more detailed error, otherwise use raw text
        let errorDetail = responseData;
        try {
          const errorJson = JSON.parse(responseData);
          errorDetail = errorJson.message || JSON.stringify(errorJson);
        } catch (e) {
          // It's not JSON, use the raw text
        }
        throw new Error(`Webhook failed with status ${response.status}: ${errorDetail}`);
      }
      
      setApiResponse(responseData);
      setSubmissionStatus('success');
      onSuccess(); // Call parent's success handler

    } catch (error: any) {
      console.error("Error processing document URL:", error);
      const msg = error.message || "An unexpected error occurred while contacting the webhook.";
      setErrorMessage(msg);
      setSubmissionStatus('error');
      onError(msg); // Call parent's error handler
    }
  };

  const renderResponse = () => {
    if (!apiResponse) return null;

    if (typeof apiResponse === 'string' && isValidHttpUrl(apiResponse)) {
      return (
        <a 
          href={apiResponse} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline flex items-center"
        >
          {apiResponse} <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      );
    }
    // If it's not a URL, or it's an object (already stringified or needs to be)
    const responseString = typeof apiResponse === 'object' ? JSON.stringify(apiResponse, null, 2) : String(apiResponse);
    return (
      <ScrollArea className="h-32 max-h-48 w-full rounded-md border p-2">
        <pre className="text-sm whitespace-pre-wrap break-all">{responseString}</pre>
      </ScrollArea>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process New Document</DialogTitle>
          <DialogDescription>
            Enter the URL of the document you want to process.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/document.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {submissionStatus === 'success' && apiResponse && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">Processing successful. Response:</p>
                {renderResponse()}
              </div>
            )}

            {submissionStatus === 'error' && errorMessage && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">Processing failed:</p>
                <p className="text-sm text-destructive-foreground bg-destructive/20 p-2 rounded-md">{errorMessage}</p>
              </div>
            )}

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </DialogClose>
              <Button type="submit" disabled={submissionStatus === 'loading'}>
                {submissionStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Process URL
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
