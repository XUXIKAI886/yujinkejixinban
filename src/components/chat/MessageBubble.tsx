'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types';
import { useChat } from '@/hooks/useChat';
import { Copy, Check, User, Bot, RotateCcw, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { SVGPreviewModal } from './SVGPreviewModal';
import { containsSVG, extractSVG } from '@/lib/svgUtils';

interface MessageBubbleProps {
  message: Message;
  isLastMessage?: boolean;
}

export function MessageBubble({ message, isLastMessage = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showSVGPreview, setShowSVGPreview] = useState(false);
  const isUser = message.role === 'user';
  const { regenerateLastMessage } = useChat();

  const hasSVG = !isUser && containsSVG(message.content);
  const svgContent = hasSVG ? extractSVG(message.content) : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: zhCN 
      });
    } catch {
      return '刚刚';
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start ${isUser ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>

        {/* Message content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1`}>
          <div className={`relative px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-800 dark:text-blue-100'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}>
            <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
              {message.content}
            </div>

            {/* Streaming indicator */}
            {message.isStreaming && message.content === '' && (
              <div className="flex items-center mt-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Message actions and timestamp */}
          <div className={`flex items-center mt-2 space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.timestamp)}
            </span>

            <div className="flex items-center space-x-1">
              {/* SVG预览按钮 - 只在包含SVG的AI消息上显示 */}
              {hasSVG && !message.isStreaming && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-md"
                  onClick={() => setShowSVGPreview(true)}
                  title="预览小红书图文"
                >
                  <Eye className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                onClick={handleCopy}
                title="复制消息"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-gray-500" />
                )}
              </Button>

              {/* 重新生成按钮 - 只在最后一条AI消息上显示 */}
              {!isUser && isLastMessage && !message.isStreaming && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={regenerateLastMessage}
                  title="重新生成"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SVG预览模态框 */}
      {hasSVG && (
        <SVGPreviewModal
          svgContent={svgContent}
          isOpen={showSVGPreview}
          onClose={() => setShowSVGPreview(false)}
        />
      )}
    </div>
  );
}
