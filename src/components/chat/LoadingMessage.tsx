'use client';

import { Bot } from 'lucide-react';

export function LoadingMessage() {
  return (
    <div className="flex justify-start group mb-6">
      <div className="flex max-w-[85%] flex-row items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          <Bot className="h-4 w-4" />
        </div>

        {/* Loading content */}
        <div className="flex flex-col items-start flex-1">
          <div className="relative px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">正在思考</span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>

          {/* 时间戳占位 */}
          <div className="flex items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              刚刚
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
