'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { WelcomeScreen } from './WelcomeScreen';

export function ChatInterface() {
  const { currentSession, isLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <ChatHeader session={currentSession} />

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <MessageList 
            messages={currentSession.messages} 
            isLoading={isLoading}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-gray-800/50">
        <MessageInput sessionId={currentSession.id} />
      </div>
    </div>
  );
}
