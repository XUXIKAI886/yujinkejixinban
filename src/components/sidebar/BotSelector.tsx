'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';
import { Search, ChefHat, LucideIcon, Bot, Headphones, Tags, Package, MessageCircle, Star, BarChart3, TrendingUp, FileText, Target, Image, Settings, ScanLine, MessageSquare, Calendar } from 'lucide-react';

// 图标映射
const iconMap: Record<string, LucideIcon> = {
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
  Target,
  Image,
  Settings,
  ScanLine,
  MessageSquare,
  Calendar,
};

// 图标渲染函数
const renderIcon = (iconName: string, className?: string) => {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    return <Search className={className} />; // 默认图标
  }
  return <IconComponent className={className} />;
};

// 侧边栏机器人配置
interface AssistantBot {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// 机器人列表配置
const ASSISTANT_BOTS: AssistantBot[] = [
  {
    id: 'meituan-category-description',
    name: '美团分类栏描述',
    description: '智能生成店铺分类标签，优化商品展示效果',
    icon: 'Tags'
  },
  {
    id: 'meal-combo-assistant',
    name: '外卖套餐搭配助手',
    description: '一个套餐会搭配2个菜品，并生成套餐关键词优化',
    icon: 'Package'
  },
  {
    id: 'meituan-review-assistant',
    name: '美团评价解释助手',
    description: '专业回复顾客评价，提升店铺好评率',
    icon: 'MessageCircle'
  },
  {
    id: 'takeout-review-generator',
    name: '补单专用外卖好评',
    description: '定制个性化评价内容，增加店铺真实性',
    icon: 'Star'
  },
  {
    id: 'meituan-store-analyzer',
    name: '美团店铺分解析',
    description: '深度分析店铺数据，优化经营策略',
    icon: 'BarChart3'
  },
  {
    id: 'takeout-weekly-report',
    name: '外卖数据周报分析',
    description: '智能分析周数据报表，指导经营决策',
    icon: 'TrendingUp'
  },
  {
    id: 'meituan-dianjin-master',
    name: '美团点金推广大师',
    description: '拥有6年推广经验，操盘过数百店铺，熟悉美团点金推广的操作手法与所有规则',
    icon: 'Target'
  },
  {
    id: 'xiaohongshu-assistant',
    name: '小红书风格图文助手',
    description: '可以将任何文档内容转换成精美好看的小红书风格图文',
    icon: 'Image'
  },
  {
    id: 'coze-operation-assistant',
    name: '美团外卖代运营助手',
    description: '用简洁明了的语言向商家解释各项优化的内容、目的和好处',
    icon: 'Settings'
  },
  {
    id: 'menu-price-extractor',
    name: '提取菜名和价格',
    description: '精准提取图中的菜品名称和价格',
    icon: 'ScanLine'
  },
  {
    id: 'similar-script-generator',
    name: '相似话术生成助手',
    description: '擅长剖析各类话术，精准把握其核心要点',
    icon: 'MessageSquare'
  },
  {
    id: 'eleme-category-description',
    name: '饿了么分类栏描述',
    description: '专注于饿了么分类栏描述生成',
    icon: 'Tags'
  },
  {
    id: 'eleme-review-assistant',
    name: '饿了么评价解释助手',
    description: '专注于饿了么回复顾客评价，提升店铺好评率',
    icon: 'MessageCircle'
  },
  {
    id: 'eleme-meal-combo',
    name: '饿了么套餐搭配助手',
    description: '一个套餐会搭配2个菜品，并生成套餐关键词优化',
    icon: 'Package'
  },
  {
    id: 'eleme-weekly-report',
    name: '饿了么周报',
    description: '专注于为饿了么外卖店铺生成内容详实的运营周报',
    icon: 'Calendar'
  },
  {
    id: 'eleme-daily-report',
    name: '饿了么日报',
    description: '专注于为饿了么外卖店铺生成内容详实的运营日报简报',
    icon: 'FileText'
  },
  {
    id: 'kefu-pro',
    name: '美团淘宝闪购在线客服助手PRO',
    description: '专业的外卖代运营客服，在微信群里与店铺老板进行日常沟通',
    icon: 'Headphones'
  },
  {
    id: 'kefu-knowledge-base',
    name: '美团淘宝闪购外卖知识库（实时更新）',
    description: '实时更新的外卖知识库，解答规则、运营、活动、售后等问题',
    icon: 'FileText'
  }
];

interface BotSelectorProps {
  onSelectBot?: () => void; // 移动端选择后关闭侧边栏
}

export function BotSelector({ onSelectBot }: BotSelectorProps) {
  const { setSelectedModel, createNewSession, clearAllSessions } = useChatStore();
  const [selectedBotId, setSelectedBotId] = useState('meituan-category-description');

  const handleSelectBot = (bot: AssistantBot) => {
    setSelectedBotId(bot.id);

    // 清空所有会话，确保完全重新开始
    clearAllSessions();

    // 根据不同的机器人选择对应的模型ID
    const getModelId = (assistantId: string): string => {
        const modelMap: Record<string, string> = {
        'meituan-category-description': 'coze-category',
        'meal-combo-assistant': 'coze-meal-combo',
        'meituan-review-assistant': 'coze-review-assistant',
        'takeout-review-generator': 'coze-review-generator',
        'meituan-store-analyzer': 'coze-store-analyzer',
        'takeout-weekly-report': 'coze-weekly-report',
        'meituan-dianjin-master': 'coze-dianjin-master',
        'xiaohongshu-assistant': 'gemini3-xiaohongshu',
        'coze-operation-assistant': 'coze-operation-assistant',
        'menu-price-extractor': 'coze-menu-price-extractor',
        'similar-script-generator': 'coze-similar-script',
        'eleme-category-description': 'eleme-category-description',
        'eleme-review-assistant': 'eleme-review-assistant',
        'eleme-meal-combo': 'eleme-meal-combo',
          'eleme-weekly-report': 'eleme-weekly-report',
          'eleme-daily-report': 'eleme-daily-report',
          'kefu-pro': 'gemini3-kefu-pro',
          'kefu-knowledge-base': 'vectorengine-kefu-knowledge-base',
        };
        return modelMap[assistantId] || 'general';
      };

    const modelId = getModelId(bot.id);
    setSelectedModel(modelId);

    // 创建新的对话会话，让用户进入对话界面
    createNewSession(modelId);

    // 移动端关闭侧边栏
    onSelectBot?.();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center mb-3 pl-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 mr-3">
          <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          AI助手专区
        </h3>
      </div>

      <div className="space-y-1">
        {ASSISTANT_BOTS.map((bot) => (
          <Button
            key={bot.id}
            variant="ghost"
            className={`w-full justify-start p-2.5 h-auto text-left transition-colors group ${
              selectedBotId === bot.id
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => handleSelectBot(bot)}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedBotId === bot.id
                  ? 'bg-gray-900 dark:bg-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {renderIcon(bot.icon, `h-4 w-4 ${
                  selectedBotId === bot.id
                    ? 'text-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400'
                }`)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">
                  {bot.name}
                </h4>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* 添加新机器人的提示 */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            已集成17个专业AI助手
          </p>
        </div>
      </div>
    </div>
  );
}
