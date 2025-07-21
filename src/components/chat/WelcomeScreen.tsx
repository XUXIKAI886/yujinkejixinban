'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bot, Search, Zap } from 'lucide-react';

export function WelcomeScreen() {

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: '美团业务专家',
      description: '10个专业AI助手，覆盖外卖经营全流程'
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: '智能内容生成',
      description: '关键词优化、菜品描述、品牌故事一键生成'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: '数据分析洞察',
      description: '店铺分析、周报解读、评价管理智能化'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-white dark:bg-gray-800">
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


      </div>
    </div>
  );
}
