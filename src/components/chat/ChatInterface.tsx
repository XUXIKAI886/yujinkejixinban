'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import { getModelById } from '@/config/models';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { WelcomeScreen } from './WelcomeScreen';

export function ChatInterface() {
  const { currentSession, isLoading, selectedModelId } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentModel = getModelById(selectedModelId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  if (!currentSession) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <ChatHeader session={currentSession} />

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <MessageList
            messages={currentSession.messages}
            isLoading={isLoading}
            currentModel={currentModel}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div>
        <MessageInput sessionId={currentSession.id} />
      </div>
    </div>
  );
}
