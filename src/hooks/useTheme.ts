'use client';

import { useState, useEffect } from 'react';

export type ThemeColor = 'default' | 'blue' | 'purple';
export type ThemeMode = 'light' | 'dark';

export interface Theme {
  color: ThemeColor;
  mode: ThemeMode;
}

const THEME_STORAGE_KEY = 'app-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>({
    color: 'default',
    mode: 'light'
  });

  // 初始化主题
  useEffect(() => {
    // 从本地存储获取主题设置
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme) as Theme;
        setTheme(parsedTheme);
        applyTheme(parsedTheme);
      } catch {
        // 如果解析失败，使用默认主题
        const defaultTheme: Theme = {
          color: 'default',
          mode: prefersDark ? 'dark' : 'light'
        };
        setTheme(defaultTheme);
        applyTheme(defaultTheme);
      }
    } else {
      // 首次访问，使用系统偏好
      const defaultTheme: Theme = {
        color: 'default',
        mode: prefersDark ? 'dark' : 'light'
      };
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  // 应用主题到DOM
  const applyTheme = (newTheme: Theme) => {
    const { color, mode } = newTheme;
    const root = document.documentElement;
    
    // 移除所有主题类
    root.classList.remove('dark', 'theme-blue', 'theme-purple');
    
    // 应用新主题类
    if (mode === 'dark') {
      root.classList.add('dark');
    }
    
    if (color === 'blue') {
      root.classList.add('theme-blue');
    } else if (color === 'purple') {
      root.classList.add('theme-purple');
    }
  };

  // 切换主题模式（深色/浅色）
  const toggleMode = () => {
    const newTheme: Theme = {
      ...theme,
      mode: theme.mode === 'light' ? 'dark' : 'light'
    };
    
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
  };

  // 设置主题颜色
  const setThemeColor = (color: ThemeColor) => {
    const newTheme: Theme = {
      ...theme,
      color
    };
    
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
  };

  // 设置完整主题
  const setFullTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
  };

  return {
    theme,
    toggleMode,
    setThemeColor,
    setFullTheme,
    isDark: theme.mode === 'dark',
    isBlue: theme.color === 'blue',
    isPurple: theme.color === 'purple'
  };
}
