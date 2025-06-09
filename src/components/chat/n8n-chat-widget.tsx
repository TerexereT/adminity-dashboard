
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createChat, type ChatProps } from '@n8n/chat'; // Corrected import
import '@n8n/chat/style.css'; // Import styles for @n8n/chat
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

// Define a type for the chat instance
type N8nChatInstance = {
  open: () => void;
  close: () => void;
  destroy?: () => void; 
};

export function N8nChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const chatInstanceRef = useRef<N8nChatInstance | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Access environment variable only on the client side after mount
    setWebhookUrl(process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL);
  }, []);

  useEffect(() => {
    if (isClient && webhookUrl && !chatInstanceRef.current) {
      const chatOptions: ChatProps = { 
        webhookUrl: webhookUrl,
        onOpen: () => {
          setIsChatOpen(true);
        },
        onClose: () => {
          setIsChatOpen(false);
        },
      };
      // Initialize chat and store the instance
      chatInstanceRef.current = createChat(chatOptions);
    }

    // Cleanup function to destroy chat instance on component unmount
    return () => {
      if (chatInstanceRef.current && typeof chatInstanceRef.current.destroy === 'function') {
        chatInstanceRef.current.destroy();
        chatInstanceRef.current = null;
      }
    };
  }, [isClient, webhookUrl]); 

  const handleToggleChat = () => {
    if (chatInstanceRef.current) {
      if (isChatOpen) {
        chatInstanceRef.current.close();
      } else {
        chatInstanceRef.current.open();
      }
    }
  };

  if (!isClient || !webhookUrl) {
    // Don't render the button if not client-side or no webhook URL
    return null;
  }

  return (
    <>
      <Button
        variant="default"
        size="icon"
        onClick={handleToggleChat}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl"
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        <MessageSquare size={28} />
      </Button>
      {/* The Chat UI is managed by the createChat call and injected into the DOM by the library,
          so we don't render a <Chat /> component here. */}
    </>
  );
}
