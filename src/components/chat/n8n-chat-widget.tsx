
'use client';

import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export const N8nChatWidget = () => {
	useEffect(() => {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('N8N Chat: NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL is not set. Chat widget will not initialize.');
      return;
    }

		createChat({
			webhookUrl: webhookUrl,
      webhookConfig: {
        method: 'POST',
        headers: {}
      },
      mode: 'window',
      chatInputKey: 'chatInput',
      metadata: {},
      showWelcomeScreen: false,
      defaultLanguage: 'en',
      initialMessages: [
        'Enter your number to start',
      ],
      i18n: {
        en: {
          title: 'Adminity Chat',
          subtitle: "manage your activities here.",
          footer: '',
          getStarted: 'New Conversation',
          inputPlaceholder: 'Type your question..',
          closeButtonTooltip: ''
        },
      },
		});
	}, []);

	return (<div></div>);
};
