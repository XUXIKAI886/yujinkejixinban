'use client';

import { Button } from '@/components/ui/button';
import { useTheme, type ThemeColor, type Theme } from '@/hooks/useTheme';
import { Check, Palette, Sun, Moon } from 'lucide-react';

interface ThemePreviewProps {
  onClose?: () => void;
}

export function ThemePreview({ onClose }: ThemePreviewProps) {
  const { theme, setFullTheme } = useTheme();

  const themes: Array<{
    color: ThemeColor;
    name: string;
    description: string;
    primaryColor: string;
    preview: {
      light: { bg: string; card: string; text: string; accent: string };
      dark: { bg: string; card: string; text: string; accent: string };
    };
  }> = [
    {
      color: 'default',
      name: '默认主题',
      description: '经典的中性灰色主题，适合专业场景',
      primaryColor: '#3b82f6',
      preview: {
        light: { bg: '#fafafa', card: '#ffffff', text: '#171717', accent: '#3b82f6' },
        dark: { bg: '#171717', card: '#262626', text: '#fafafa', accent: '#3b82f6' }
      }
    },
    {
      color: 'blue',
      name: '蓝色主题',
      description: '清新的蓝色主题，营造专业科技感',
      primaryColor: '#2563eb',
      preview: {
        light: { bg: '#f8fafc', card: '#ffffff', text: '#0f172a', accent: '#2563eb' },
        dark: { bg: '#0f172a', card: '#1e293b', text: '#f8fafc', accent: '#60a5fa' }
      }
    },
    {
      color: 'purple',
      name: '紫色主题',
      description: '优雅的紫色主题，展现创意与活力',
      primaryColor: '#9333ea',
      preview: {
        light: { bg: '#fdfcff', card: '#ffffff', text: '#4c1d95', accent: '#9333ea' },
        dark: { bg: '#4c1d95', card: '#5b21b6', text: '#fdfcff', accent: '#c084fc' }
      }
    }
  ];

  const handleThemeSelect = (color: ThemeColor, mode: 'light' | 'dark') => {
    const newTheme: Theme = { color, mode };
    setFullTheme(newTheme);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          选择主题
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          选择您喜欢的颜色主题和模式
        </p>
      </div>

      <div className="space-y-6">
        {themes.map((themeOption) => (
          <div key={themeOption.color} className="space-y-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: themeOption.primaryColor }}
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {themeOption.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {themeOption.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 浅色模式预览 */}
              <div
                className="relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105"
                style={{
                  backgroundColor: themeOption.preview.light.bg,
                  borderColor: theme.color === themeOption.color && theme.mode === 'light' 
                    ? themeOption.primaryColor 
                    : '#e5e7eb'
                }}
                onClick={() => handleThemeSelect(themeOption.color, 'light')}
              >
                {theme.color === themeOption.color && theme.mode === 'light' && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4" style={{ color: themeOption.primaryColor }} />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sun className="w-4 h-4" style={{ color: themeOption.preview.light.text }} />
                    <span className="text-sm font-medium" style={{ color: themeOption.preview.light.text }}>
                      浅色模式
                    </span>
                  </div>
                  
                  <div 
                    className="p-3 rounded"
                    style={{ backgroundColor: themeOption.preview.light.card }}
                  >
                    <div className="space-y-2">
                      <div 
                        className="h-2 rounded"
                        style={{ backgroundColor: themeOption.preview.light.accent, width: '60%' }}
                      />
                      <div 
                        className="h-1 rounded"
                        style={{ backgroundColor: themeOption.preview.light.text, opacity: 0.3, width: '80%' }}
                      />
                      <div 
                        className="h-1 rounded"
                        style={{ backgroundColor: themeOption.preview.light.text, opacity: 0.2, width: '40%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 深色模式预览 */}
              <div
                className="relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105"
                style={{
                  backgroundColor: themeOption.preview.dark.bg,
                  borderColor: theme.color === themeOption.color && theme.mode === 'dark' 
                    ? themeOption.primaryColor 
                    : '#374151'
                }}
                onClick={() => handleThemeSelect(themeOption.color, 'dark')}
              >
                {theme.color === themeOption.color && theme.mode === 'dark' && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4" style={{ color: themeOption.primaryColor }} />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Moon className="w-4 h-4" style={{ color: themeOption.preview.dark.text }} />
                    <span className="text-sm font-medium" style={{ color: themeOption.preview.dark.text }}>
                      深色模式
                    </span>
                  </div>
                  
                  <div 
                    className="p-3 rounded"
                    style={{ backgroundColor: themeOption.preview.dark.card }}
                  >
                    <div className="space-y-2">
                      <div 
                        className="h-2 rounded"
                        style={{ backgroundColor: themeOption.preview.dark.accent, width: '60%' }}
                      />
                      <div 
                        className="h-1 rounded"
                        style={{ backgroundColor: themeOption.preview.dark.text, opacity: 0.3, width: '80%' }}
                      />
                      <div 
                        className="h-1 rounded"
                        style={{ backgroundColor: themeOption.preview.dark.text, opacity: 0.2, width: '40%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {onClose && (
        <div className="flex justify-center pt-4">
          <Button onClick={onClose} variant="outline">
            关闭
          </Button>
        </div>
      )}
    </div>
  );
}
