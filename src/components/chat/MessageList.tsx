'use client';

import { Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import { LoadingMessage } from './LoadingMessage';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            开始新的对话
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            在下方输入框中输入您的问题或想法
          </p>
        </div>
      </div>
    );
  }

  // 检查是否有正在流式传输的消息
  const hasStreamingMessage = messages.some(message => message.isStreaming);

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLastMessage={index === messages.length - 1}
        />
      ))}

      {/* 只有在没有流式传输消息且正在加载时才显示LoadingMessage */}
      {isLoading && !hasStreamingMessage && <LoadingMessage />}
    </div>
  );
}
