'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ChatSession } from '@/types';
import { getModelById } from '@/config/models';
import { useChatStore } from '@/lib/store';
import { RotateCcw, Bot, PenTool, BarChart3, Code, Globe, GraduationCap, Search, ChefHat, Headphones, Tags, Package, MessageCircle, Star, TrendingUp, FileText, Sparkles, LucideIcon } from 'lucide-react';

// 图标映射 - 与BotSelector保持一致
const iconMap: Record<string, LucideIcon> = {
  // BotSelector中使用的图标
  Search,
  ChefHat,
  Headphones,
  Tags,
  Package,
  MessageCircle,
  Star,
  BarChart3,
  TrendingUp,
  FileText,
  Sparkles,
  // 其他可能用到的图标
  Bot,
  PenTool,
  Code,
  Globe,
  GraduationCap,
};

// 图标渲染函数
const renderIcon = (iconName: string, className?: string) => {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    return <Bot className={className} />; // 默认图标
  }
  return <IconComponent className={className} />;
};

interface ChatHeaderProps {
  session: ChatSession;
}

export function ChatHeader({ session }: ChatHeaderProps) {
  const { clearMessages } = useChatStore();
  const model = getModelById(session.modelId);

  const handleClearMessages = () => {
    if (confirm('确定要清空当前对话的所有消息吗？')) {
      clearMessages(session.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          {renderIcon(model?.icon || 'Bot', 'h-5 w-5 text-gray-600 dark:text-gray-400')}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {model?.name || '未知机器人'}
          </h2>
          <div className="flex items-center space-x-3 mt-0.5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {model?.description || '智能对话助手'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearMessages}
          disabled={session.messages.length === 0}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg px-3 py-2"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          清空对话
        </Button>
      </div>
    </div>
  );
}
