'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';
import { getModelById } from '@/config/models';
import { MessageCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ChatHistoryProps {
  onSelectChat?: () => void;
}

export function ChatHistory({ onSelectChat }: ChatHistoryProps) {
  const { sessions, currentSession, setCurrentSession, deleteSession } = useChatStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleSelectSession = (session: typeof sessions[0]) => {
    setCurrentSession(session);
    onSelectChat?.();
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm === sessionId) {
      deleteSession(sessionId);
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(sessionId);
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: zhCN 
      });
    } catch {
      return '刚刚';
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="p-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          还没有对话记录
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          点击&quot;新建对话&quot;开始聊天
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
        <span>对话历史</span>
      </h3>

      <div className="space-y-3">
        {sessions.map((session, index) => {
          const model = getModelById(session.modelId);
          const isActive = currentSession?.id === session.id;
          const isDeleting = showDeleteConfirm === session.id;

          return (
            <div
              key={session.id}
              className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 animate-slide-up ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-700/50 shadow-sm'
                  : 'hover:bg-white/30 dark:hover:bg-gray-800/30 hover:shadow-sm border border-transparent'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleSelectSession(session)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    <span className="text-white text-sm">{model?.icon || '🤖'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-medium ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {model?.name || '未知模型'}
                      </span>
                    </div>

                    <h4 className={`text-sm font-semibold truncate transition-colors ${
                      isActive
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}>
                      {session.title}
                    </h4>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{session.messages.length} 条消息</span>
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTime(session.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-lg transition-all duration-200 ${
                      isDeleting
                        ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    onClick={(e) => handleDeleteSession(session.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isDeleting && (
                <div className="absolute inset-0 glass-effect bg-red-50/90 dark:bg-red-900/40 rounded-xl flex items-center justify-center animate-scale-in">
                  <div className="text-center">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-3">
                      确定删除此对话？
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 text-xs px-3 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                      >
                        删除
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs px-3 hover:bg-white/20 dark:hover:bg-gray-800/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(null);
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
