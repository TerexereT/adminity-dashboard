
'use client';

import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export const N8nChatWidget = () => {
	useEffect(() => {
		createChat({
			webhookUrl: process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL,
      webhookConfig: {
        method: 'POST',
        headers: {}
      },
      // target: '#n8n-chat',
      mode: 'window',
      chatInputKey: 'chatInput',
      // chatSessionKey: 'sessionId',
      metadata: {},
      showWelcomeScreen: false,
      defaultLanguage: 'en',
      initialMessages: [
        'Hi there! 👋',
      ],
		});
	}, []);

	return (<div></div>);
};