'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BotSelector } from './BotSelector';
import { WeatherWidget } from '@/components/ui/weather-widget';
import { Menu, X } from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between min-h-[2.5rem]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black text-sm font-bold">AI</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              域锦科技
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Bot Selector */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <BotSelector onSelectBot={() => setIsOpen(false)} />
      </div>

      {/* Footer */}
      <div className="p-4">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              域锦科技AI 系统 v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg border border-gray-200 dark:border-gray-600"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-80 h-full">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[80vw]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
