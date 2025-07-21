'use client';

import { useState, useEffect } from 'react';
import { getTipByIndex, getTotalTipsCount } from '@/lib/tips';

// 简洁版运营小贴士组件 - 放在标题右侧
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
    }, 200);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (!currentTip) return null;

  return (
    <div className="flex items-center justify-center space-x-2 text-sm w-full">
      <span className="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
        美团运营小贴士：
      </span>
      <span
        className={`font-medium text-gray-800 dark:text-gray-200 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-70'
        }`}
      >
        {currentTip}
      </span>
    </div>
  );
}
