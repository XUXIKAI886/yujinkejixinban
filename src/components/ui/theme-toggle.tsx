'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Palette, ChevronDown } from 'lucide-react';
import { useTheme, type ThemeColor } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleMode, setThemeColor, isDark } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const themeColors: { value: ThemeColor; label: string; color: string }[] = [
    { value: 'default', label: '默认', color: '#3b82f6' },
    { value: 'blue', label: '蓝色', color: '#2563eb' },
    { value: 'purple', label: '紫色', color: '#9333ea' }
  ];

  const currentThemeColor = themeColors.find(t => t.value === theme.color) || themeColors[0];

  return (
    <div className="flex items-center space-x-2">
      {/* 主题颜色选择器 */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-10 h-10 p-0 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/30 transition-all duration-200"
          title="选择主题颜色"
        >
          <div className="relative w-5 h-5">
            <Palette className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
              style={{ backgroundColor: currentThemeColor.color }}
            />
          </div>
        </Button>

        {/* 颜色选择下拉菜单 */}
        {showColorPicker && (
          <div className="absolute top-12 right-0 z-50 min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
            {themeColors.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  setThemeColor(color.value);
                  setShowColorPicker(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${
                  theme.color === color.value ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-gray-700 dark:text-gray-300">{color.label}</span>
                {theme.color === color.value && (
                  <div className="ml-auto w-2 h-2 bg-current rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* 点击外部关闭下拉菜单 */}
        {showColorPicker && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowColorPicker(false)}
          />
        )}
      </div>

      {/* 深色/浅色模式切换 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMode}
        className="w-10 h-10 p-0 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/30 transition-all duration-200 group"
        title={isDark ? '切换到浅色模式' : '切换到深色模式'}
      >
        <div className="relative w-5 h-5">
          <Sun
            className={`absolute inset-0 h-5 w-5 text-gray-600 dark:text-gray-400 transition-all duration-300 ${
              isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          />
          <Moon
            className={`absolute inset-0 h-5 w-5 text-gray-600 dark:text-gray-400 transition-all duration-300 ${
              isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
            }`}
          />
        </div>
      </Button>
    </div>
  );
}
