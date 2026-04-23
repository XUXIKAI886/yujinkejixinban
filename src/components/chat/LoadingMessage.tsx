'use client';

import { Bot } from 'lucide-react';

export function LoadingMessage() {
  return (
    <div className="flex justify-start group animate-fade-in">
      <div className="flex max-w-[85%] lg:max-w-[75%] flex-row items-start gap-3">
        {/* 头像 */}
        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground">
          <Bot className="h-4 w-4" />
        </div>

        {/* 加载内容 */}
        <div className="flex flex-col items-start flex-1">
          <div className="message-bubble message-bubble-assistant relative px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/70">正在思考</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse-soft" />
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse-soft" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>

          {/* 时间戳 */}
          <div className="flex items-center mt-2">
            <span className="text-xs text-muted-foreground">刚刚</span>
          </div>
        </div>
      </div>
    </div>
  );
}
