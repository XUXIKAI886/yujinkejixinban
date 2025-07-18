'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';
import { useChat } from '@/hooks/useChat';
import { Send, Square } from 'lucide-react';

interface MessageInputProps {
  sessionId: string;
}

export function MessageInput({ sessionId: _sessionId }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading, error } = useChatStore();
  const { sendMessage, stopGeneration } = useChat();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // 使用useChat hook发送消息
    await sendMessage(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStop = () => {
    stopGeneration();
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <div className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500 transition-colors focus-within:border-gray-500 dark:focus-within:border-gray-400">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="输入您的消息..."
                className="w-full resize-none bg-transparent px-4 py-3 pr-14 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none disabled:opacity-50 rounded-lg"
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />

              <div className="absolute right-2 bottom-2">
                {isLoading ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleStop}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="停止生成"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!input.trim() || isLoading}
                    className="h-8 w-8 p-0 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title="发送消息"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Character count and hints */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            <span>Shift + Enter 换行</span>
            <span>Enter 发送</span>
          </div>
          <span>{input.length} 字符</span>
        </div>
        </form>
      </div>
    </div>
  );
}
