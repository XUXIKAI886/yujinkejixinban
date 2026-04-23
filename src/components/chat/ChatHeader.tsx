'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ChatSession } from '@/types';
import { getModelById } from '@/config/models';
import { useChatStore } from '@/lib/store';
import { 
  RotateCcw, Bot, PenTool, BarChart3, Code, Globe, GraduationCap, 
  Search, ChefHat, Headphones, Tags, Package, MessageCircle, Star, 
  TrendingUp, FileText, Sparkles, Target, Palette, Settings, ScanLine, 
  MessageSquare, LucideIcon, Calendar, Image 
} from 'lucide-react';

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  Search, ChefHat, Headphones, Tags, Package, MessageCircle, Star, 
  BarChart3, TrendingUp, FileText, Sparkles, Target, Palette, Settings, 
  ScanLine, MessageSquare, Bot, PenTool, Code, Globe, GraduationCap, 
  Calendar, Image,
};

const renderIcon = (iconName: string, className?: string) => {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) return <Bot className={className} />;
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
    <header className="chat-header flex items-center justify-between px-6 py-4">
      {/* 左侧：机器人信息 */}
      <div className="flex items-center gap-4 min-w-0">
        {/* 机器人头像 */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
            {renderIcon(model?.icon || 'Bot', 'h-5 w-5 text-primary')}
          </div>
          {/* 在线状态 */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
        </div>

        {/* 机器人名称和描述 */}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground leading-tight truncate">
            {model?.name || '未知机器人'}
          </h2>
          <p className="text-sm text-muted-foreground leading-tight mt-0.5 truncate max-w-md">
            {model?.description || '智能对话助手'}
          </p>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeToggle />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearMessages}
          disabled={session.messages.length === 0}
          className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">清空对话</span>
        </Button>
      </div>
    </header>
  );
}
