'use client';

import { useState, useEffect } from 'react';
import { getTipByIndex, getTotalTipsCount } from '@/lib/tips';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

// 美化版运营小贴士组件
export function SimpleTipsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const totalTips = getTotalTipsCount();
  const currentTip = getTipByIndex(currentIndex);

  // 自动播放
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalTips);
    }, 8000); // 8秒切换一次，让用户有足够时间阅读

    return () => clearInterval(timer);
  }, [totalTips, isPaused]);

  // 平滑过渡动画
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // 手动切换到上一条
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalTips) % totalTips);
  };

  // 手动切换到下一条
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalTips);
  };

  if (!currentTip) return null;

  return (
    <div
      className="flex items-center justify-center space-x-3 w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 左侧图标和标题 */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-amber-600 dark:text-amber-400 text-sm whitespace-nowrap">
          运营小贴士
        </span>
      </div>

      {/* 左箭头 */}
      <button
        onClick={handlePrevious}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-60 hover:opacity-100"
        title="上一条"
      >
        <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0 relative overflow-hidden">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isVisible
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-1'
          }`}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center leading-relaxed font-medium truncate">
            {currentTip}
          </p>
        </div>
      </div>

      {/* 右箭头 */}
      <button
        onClick={handleNext}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-60 hover:opacity-100"
        title="下一条"
      >
        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {/* 进度指示器 */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          {String(currentIndex + 1).padStart(2, '0')}/{String(totalTips).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
