'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BotSelector } from './BotSelector';
import { Menu, X, Sparkles } from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* 品牌头部 */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 品牌 Logo */}
            <div className="relative">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              {/* 在线状态指示 */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-sidebar" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-sidebar-foreground leading-tight">
                域锦科技
              </h1>
              <p className="text-xs text-muted-foreground">AI 智能平台</p>
            </div>
          </div>
          
          {/* 移动端关闭按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="px-4">
        <div className="h-px bg-border" />
      </div>

      {/* 机器人选择器 */}
      <div className="flex-1 overflow-hidden py-3">
        <BotSelector onSelectBot={() => setIsOpen(false)} />
      </div>

      {/* 底部版本信息 */}
      <div className="px-4 py-4">
        <div className="text-center text-xs text-muted-foreground">
          <span>域锦科技 AI v1.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 移动端菜单按钮 */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 h-10 w-10 bg-card hover:bg-accent border-border shadow-lg transition-all rounded-xl"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5 text-foreground" />
      </Button>

      {/* 桌面端侧边栏 */}
      <div className="hidden md:block w-72 h-full flex-shrink-0">
        {sidebarContent}
      </div>

      {/* 移动端侧边栏遮罩和抽屉 */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          {/* 侧边栏抽屉 */}
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
