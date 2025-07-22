'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Eye } from 'lucide-react';
import { optimizeSVGForDisplay, downloadSVGAsPNG, validateSVG } from '@/lib/svgUtils';

interface SVGPreviewModalProps {
  svgContent: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SVGPreviewModal({ svgContent, isOpen, onClose }: SVGPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  // 验证和优化SVG内容
  const isValidSVG = validateSVG(svgContent);
  const optimizedSVG = isValidSVG ? optimizeSVGForDisplay(svgContent) : '';

  // 将SVG转换为PNG并下载
  const downloadAsPNG = async () => {
    if (!isValidSVG) {
      setError('SVG内容无效，无法下载');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      await downloadSVGAsPNG(svgContent, `xiaohongshu-card-${Date.now()}.png`);
    } catch (error) {
      console.error('下载PNG失败:', error);
      setError('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  // 处理ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              小红书图文预览
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={downloadAsPNG}
              disabled={isDownloading}
              className="bg-pink-500 hover:bg-pink-600 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? '下载中...' : '下载PNG'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* SVG预览区域 */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            {!isValidSVG ? (
              <div className="text-center text-red-600 dark:text-red-400">
                <p className="text-lg font-medium mb-2">⚠️ SVG内容无效</p>
                <p className="text-sm">无法解析SVG内容，请检查生成的代码是否完整</p>
              </div>
            ) : (
              <div
                ref={svgRef}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-full max-h-full overflow-auto"
                dangerouslySetInnerHTML={{ __html: optimizedSVG }}
              />
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}
        </div>
        
        {/* 底部提示 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 提示：点击"下载PNG"可以将图文保存为高清图片，适合在小红书等平台分享
          </p>
        </div>
      </div>
    </div>
  );
}
