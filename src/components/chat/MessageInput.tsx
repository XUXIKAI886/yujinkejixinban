'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';
import { useChat } from '@/hooks/useChat';
import { Send, Square, Paperclip, X } from 'lucide-react';

interface MessageInputProps {
  sessionId: string;
}

export function MessageInput({ sessionId: _sessionId }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage = input.trim();
    const files = selectedFiles;

    setInput('');
    setSelectedFiles([]);

    // 使用useChat hook发送消息（包含文件）
    await sendMessage(userMessage, files);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }

    // 清空input以允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* 文件预览区域 */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <div className="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 hover:border-gray-400 dark:hover:border-gray-500 transition-colors focus-within:border-gray-500 dark:focus-within:border-gray-400">
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

              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                {/* 文件上传按钮 */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleAttachClick}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="上传图片"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                {/* 发送/停止按钮 */}
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
                    disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
                    className="h-8 w-8 p-0 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title="发送消息"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
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
