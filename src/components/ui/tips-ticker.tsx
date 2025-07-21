'use client';

import { useState, useEffect } from 'react';
import { getTipByIndex, getTotalTipsCount } from '@/lib/tips';
import { Lightbulb, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TipsTickerProps {
  autoPlay?: boolean;
  interval?: number; // 滚动间隔，单位毫秒
  showControls?: boolean;
}

export function TipsTicker({ 
  autoPlay = true, 
  interval = 8000, // 默认8秒切换一次
  showControls = true 
}: TipsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isVisible, setIsVisible] = useState(true);
  
  const totalTips = getTotalTipsCount();
  const currentTip = getTipByIndex(currentIndex);

  // 下一条小贴士
  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % totalTips);
  };

  // 上一条小贴士
  const prevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + totalTips) % totalTips);
  };

  // 切换播放状态
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 自动播放逻辑
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      nextTip();
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval]);

  // 淡入淡出动画
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (!currentTip) return null;

  return (
    <div className="flex items-center justify-between w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-4 py-2 border-b border-blue-100 dark:border-gray-600">
      {/* 小贴士图标和内容 */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex-shrink-0">
              运营小贴士
            </span>
            <span className="text-xs text-blue-500 dark:text-blue-400 flex-shrink-0">
              {currentIndex + 1}/{totalTips}
            </span>
          </div>
          
          <div 
            className={`text-sm text-gray-700 dark:text-gray-200 transition-opacity duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <span className="line-clamp-1">
              {currentTip}
            </span>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      {showControls && (
        <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevTip}
            className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-gray-600"
            title="上一条"
          >
            <SkipBack className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-gray-600"
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            ) : (
              <Play className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTip}
            className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-gray-600"
            title="下一条"
          >
            <SkipForward className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </Button>
        </div>
      )}
    </div>
  );
}

// 简化版小贴士组件（用于移动端或空间受限的地方）
export function SimpleTipsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const totalTips = getTotalTipsCount();
  const currentTip = getTipByIndex(currentIndex);

  // 自动播放
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalTips);
    }, 6000); // 6秒切换一次

    return () => clearInterval(timer);
  }, [totalTips]);

  // 淡入淡出动画
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-gray-700 rounded-full">
      <Lightbulb className="h-3 w-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
      <span 
        className={`text-xs text-gray-600 dark:text-gray-300 transition-opacity duration-300 truncate ${
          isVisible ? 'opacity-100' : 'opacity-50'
        }`}
      >
        {currentTip}
      </span>
    </div>
  );
}
