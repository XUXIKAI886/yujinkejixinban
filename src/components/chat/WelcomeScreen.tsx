'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useChatStore } from '@/lib/store';
import { Sparkles, Tags, BarChart3, MessageCircle, ArrowRight, Zap } from 'lucide-react';

// 热门助手快捷入口
const HOT_BOTS = [
  { id: 'coze-category', name: '美团分类栏描述', icon: Tags },
  { id: 'coze-meal-combo', name: '套餐搭配助手', icon: Zap },
  { id: 'coze-review-assistant', name: '评价解释助手', icon: MessageCircle },
];

// 核心能力展示
const FEATURES = [
  {
    icon: Tags,
    title: '分类优化',
    description: '智能生成分类标签，提升商品展示效果与搜索排名',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: BarChart3,
    title: '数据分析',
    description: '周报解读、店铺分析，用数据驱动经营决策',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: MessageCircle,
    title: '评价管理',
    description: '好评生成、差评处理，全面提升店铺口碑',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

export function WelcomeScreen() {
  const { setSelectedModel, createNewSession, clearAllSessions } = useChatStore();

  const handleQuickStart = (modelId: string) => {
    clearAllSessions();
    setSelectedModel(modelId);
    createNewSession(modelId);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full p-6 sm:p-8 bg-background overflow-auto">
      {/* 主题切换 */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-3xl w-full">
        {/* 品牌区域 */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-background flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            域锦科技 AI 平台
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            专业外卖代运营智能助手，覆盖美团与饿了么双平台全流程
          </p>
        </div>

        {/* 核心能力卡片 */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="welcome-card group rounded-xl p-5 bg-card cursor-default"
            >
              <div className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* 快速开始区域 */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">快速开始</span>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-3">
            {HOT_BOTS.map((bot) => (
              <button
                key={bot.id}
                onClick={() => handleQuickStart(bot.id)}
                className="hot-bot-card flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-transparent hover:border-primary/20 text-left group"
              >
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <bot.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground truncate flex-1">
                  {bot.name}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            从左侧选择更多 AI 助手，开启智能运营之旅
          </p>
        </div>
      </div>
    </div>
  );
}
