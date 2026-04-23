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
import { copyToClipboard } from '@/lib/tauriClipboard';

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
      const success = await copyToClipboard(message.content);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handlePreviewClick = () => {
    setShowSVGPreview(true);
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-slide-up`}>
      <div className={`flex max-w-[85%] lg:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        {/* 头像 */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>

        {/* 消息内容 */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
          <div className={`message-bubble relative px-4 py-3 ${
            isUser
              ? 'message-bubble-user'
              : 'message-bubble-assistant'
          }`}>
            <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
              {message.content}
            </div>

            {/* 流式输出指示器 */}
            {message.isStreaming && message.content === '' && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse-soft" />
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse-soft" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
              </div>
            )}
          </div>

          {/* 时间戳和操作按钮 */}
          <div className={`flex items-center mt-2 gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>

            <div className="flex items-center gap-1">
              {/* SVG 预览按钮 */}
              {hasSVG && !message.isStreaming && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-pink-500 hover:text-pink-600 hover:bg-pink-500/10 rounded-lg"
                  onClick={handlePreviewClick}
                  title="预览小红书图文"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}

              {/* 复制按钮 */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                onClick={handleCopy}
                title="复制消息"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>

              {/* 重新生成按钮 */}
              {!isUser && isLastMessage && !message.isStreaming && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                  onClick={regenerateLastMessage}
                  title="重新生成"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SVG 预览模态框 */}
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
