'use client';

import { Message, ModelConfig } from '@/types';
import { MessageBubble } from './MessageBubble';
import { LoadingMessage } from './LoadingMessage';
import { MessageCircle } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  currentModel?: ModelConfig;
}

export function MessageList({ messages, isLoading, currentModel }: MessageListProps) {
  // 空状态 - 显示欢迎语或默认提示
  if (messages.length === 0 && !isLoading) {
    // 如果当前模型有欢迎语
    if (currentModel?.welcomeMessage) {
      return (
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {currentModel.name}
            </h3>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-xl p-6 text-left">
              <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">
                {currentModel.welcomeMessage}
              </pre>
            </div>
          </div>
        </div>
      );
    }

    // 默认空状态
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MessageCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            开始新的对话
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            在下方输入框中输入您的问题或想法，开启智能对话
          </p>
        </div>
      </div>
    );
  }

  // 检查是否有正在流式传输的消息
  const hasStreamingMessage = messages.some(message => message.isStreaming);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLastMessage={index === messages.length - 1}
        />
      ))}

      {/* 加载状态 */}
      {isLoading && !hasStreamingMessage && <LoadingMessage />}
    </div>
  );
}
