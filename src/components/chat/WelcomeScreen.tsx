'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useChatStore } from '@/lib/store';
import { Plus, Bot, Search, Zap, Target } from 'lucide-react';

export function WelcomeScreen() {
  const { createNewSession, selectedModelId, setSelectedModel } = useChatStore();

  const handleStartChat = (modelId?: string) => {
    if (modelId) {
      setSelectedModel(modelId);
    }
    createNewSession(modelId || selectedModelId);
  };

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: '专业机器人',
      description: '每个机器人都专注于特定领域的专业服务'
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: '关键词优化',
      description: '专业的菜品关键词生成和优化助手'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: '实时响应',
      description: '快速获得专业的智能回复和建议'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-white dark:bg-gray-950">
      {/* 主题切换按钮 - 右上角 */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl w-full text-center">
        {/* Logo and title */}
        <div className="mb-16">
          <div className="relative inline-block mb-8">
            <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto">
              <Bot className="h-8 w-8 text-white dark:text-black" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-4">
            域锦科技AI平台
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            专业的AI机器人助手，为您提供专业化的智能服务
          </p>
        </div>



        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <div className="text-gray-600 dark:text-gray-400">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick start info */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            开始使用AI机器人
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    关键词优化助手
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    专业的菜品关键词生成和优化助手
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                请在左侧选择机器人，然后点击下方按钮开始对话
              </p>
            </div>
          </div>
        </div>

        {/* Default start button */}
        <div className="mb-16">
          <Button
            size="lg"
            onClick={() => handleStartChat('coze')}
            className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black px-8 py-3 text-base font-medium transition-colors rounded-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            开始对话
          </Button>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p>基于 Next.js 15 + Tailwind CSS + shadcn/ui 构建</p>
          </div>
        </div>
      </div>
    </div>
  );
}
