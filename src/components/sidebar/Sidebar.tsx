'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BotSelector } from './BotSelector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemePreview } from '@/components/ui/theme-preview';
import { Menu, X, Palette } from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemePreview, setShowThemePreview] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black text-sm font-bold">AI</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              域锦科技
            </h1>
          </div>

          {/* 主题切换按钮 */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThemePreview(true)}
              className="w-10 h-10 p-0 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/30 transition-all duration-200"
              title="主题预览"
            >
              <Palette className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Bot Selector */}
      <div className="flex-1 overflow-y-auto p-4">
        <BotSelector onSelectBot={() => setIsOpen(false)} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
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
        className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-lg border border-gray-200 dark:border-gray-700"
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

      {/* 主题预览模态框 */}
      {showThemePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowThemePreview(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <ThemePreview onClose={() => setShowThemePreview(false)} />
          </div>
        </div>
      )}
    </>
  );
}
