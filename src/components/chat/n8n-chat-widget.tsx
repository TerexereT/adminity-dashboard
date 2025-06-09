
'use client';

import React, { useState, useEffect } from 'react';
import { Chat, type ChatProps } from '@n8n/chat';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export function N8nChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Access environment variable only on the client side after mount
    setWebhookUrl(process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL);
  }, []);

  if (!isClient || !webhookUrl) {
    // Don't render anything on the server or if webhookUrl is not set
    // This also prevents hydration mismatch for process.env access
    return null;
  }

  const chatProps: ChatProps = {
    webhookUrl: webhookUrl,
    // title: "Admin Support", // Optional: Customize title
    // welcomeMessage: "Hello! How can we assist you today?", // Optional: Customize welcome message
    // showResponseTime: false, // Optional
  };

  return (
    <>
      <Button
        variant="default"
        size="icon"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl"
        aria-label="Open chat"
      >
        <MessageSquare size={28} />
      </Button>
      {isChatOpen && ( // Conditionally render Chat component
        <Chat
          {...chatProps}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
