'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';
import { useChat } from '@/hooks/useChat';
import { Send, Square, Paperclip, X, ImageIcon } from 'lucide-react';

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

  // 自动调整高度
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

    const userMessage = input.trim() || (selectedFiles.length > 0 ? '请分析这张图片' : '');
    const files = selectedFiles;

    setInput('');
    setSelectedFiles([]);

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

  const canSend = (input.trim() || selectedFiles.length > 0) && !isLoading;

  return (
    <div className="input-area p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* 文件预览区域 */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group animate-scale-in">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 backdrop-blur-sm text-background text-xs px-2 py-1 rounded-b-xl truncate">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 输入区域 */}
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <div className="input-textarea relative rounded-xl border border-border bg-card hover:border-muted-foreground/30 focus-within:border-ring transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  placeholder="输入您的消息..."
                  className="w-full resize-none bg-transparent px-4 py-3 pr-24 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 rounded-xl text-sm"
                  rows={1}
                  disabled={isLoading}
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                />

                {/* 工具按钮 */}
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  {/* 文件上传按钮 */}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleAttachClick}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
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
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="停止生成"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!canSend}
                      className="h-8 w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed btn-hover-lift"
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

          {/* 错误提示 */}
          {error && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* 操作提示 */}
          <div className="flex items-center justify-between mt-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
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
