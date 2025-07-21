'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';
import { useChat } from '@/hooks/useChat';
import { uploadImages } from '@/lib/imageUpload';
import { Send, Square, Paperclip, X, Upload } from 'lucide-react';

interface MessageInputProps {
  sessionId: string;
}

export function MessageInput({ sessionId: _sessionId }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, error, selectedModelId } = useChatStore();
  const { sendMessage, stopGeneration } = useChat();

  // 检查当前是否是支持图片的机器人
  const isImageSupportedBot = selectedModelId === 'coze-logo-design';

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

    if ((!input.trim() && uploadedImages.length === 0) || isLoading || isUploading) return;

    const userMessage = input.trim();
    const images = [...uploadedImages];

    // 清空输入和图片
    setInput('');
    setUploadedImages([]);

    try {
      let messageContent = userMessage;

      // 如果有图片，先上传获取URL
      if (images.length > 0) {
        setIsUploading(true);
        console.log('🖼️ 开始上传图片...');

        const uploadResults = await uploadImages(images);
        console.log('✅ 图片上传完成:', uploadResults);

        // 将图片URL添加到消息内容中
        const imageUrls = uploadResults.map(result => result.url);
        const imageText = imageUrls.map((url, index) =>
          `图片${index + 1}: ${url}`
        ).join('\n');

        messageContent = userMessage ?
          `${userMessage}\n\n${imageText}` :
          imageText;

        setIsUploading(false);
      }

      // 使用useChat hook发送消息（包含图片URL）
      await sendMessage(messageContent);

    } catch (error) {
      console.error('处理消息失败:', error);
      setIsUploading(false);
      // 如果上传失败，恢复输入内容
      setInput(userMessage);
      setUploadedImages(images);
    }
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

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter(file =>
        file.type.startsWith('image/')
      );
      setUploadedImages(prev => [...prev, ...imageFiles]);
    }
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 移除图片
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* 图片预览区域 */}
          {uploadedImages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`上传的图片 ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="删除图片"
                  >
                    <X className="h-3 w-3" />
                  </button>
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
                  placeholder={isImageSupportedBot ? "输入您的消息或上传图片..." : "输入您的消息..."}
                  className="w-full resize-none bg-transparent px-4 py-3 pr-20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none disabled:opacity-50 rounded-lg"
                  rows={1}
                  disabled={isLoading || isUploading}
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                />

                <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                  {/* 图片上传按钮 - 只在支持图片的机器人中显示 */}
                  {isImageSupportedBot && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={triggerFileSelect}
                      disabled={isLoading}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="上传图片"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  )}

                  {/* 发送/停止/上传按钮 */}
                  {isUploading ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled
                      className="h-8 w-8 p-0 text-blue-500 dark:text-blue-400 rounded-lg"
                      title="正在上传图片..."
                    >
                      <Upload className="h-4 w-4 animate-pulse" />
                    </Button>
                  ) : isLoading ? (
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
                      disabled={(!input.trim() && uploadedImages.length === 0) || isLoading || isUploading}
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

          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

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
