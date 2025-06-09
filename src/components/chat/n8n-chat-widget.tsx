
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createChat, type ChatProps } from '@n8n/chat'; // Changed import
import '@n8n/chat/style.css'; // Import styles for @n8n/chat
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

// Define a type for the chat instance, if available from the library, otherwise use 'any'
type N8nChatInstance = {
  open: () => void;
  close: () => void;
  destroy?: () => void; // Optional destroy method
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
      const chatOptions: ChatProps = { // Assuming ChatProps is the correct type for options
        webhookUrl: webhookUrl,
        // title: "Admin Support", // Optional: Customize title
        // welcomeMessage: "Hello! How can we assist you today?", // Optional: Customize welcome message
        // showResponseTime: false, // Optional
        onOpen: () => {
          setIsChatOpen(true);
        },
        onClose: () => {
          setIsChatOpen(false);
        },
      };
      chatInstanceRef.current = createChat(chatOptions);
    }

    // Cleanup function
    return () => {
      if (chatInstanceRef.current && typeof chatInstanceRef.current.destroy === 'function') {
        chatInstanceRef.current.destroy();
      }
      // Setting ref to null if instance is destroyed or on unmount, 
      // though createChat might not need to be called again unless webhookUrl changes.
      // For simplicity, we're not re-initializing on webhookUrl change here, 
      // but in a real app, you might want to destroy and re-create if URL changes.
    };
  }, [isClient, webhookUrl]); // Dependencies for creating/managing the chat instance

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
      {/* The Chat UI is now managed by the createChat call and injected into the DOM,
          so we don't render a <Chat /> component here. */}
    </>
  );
}
