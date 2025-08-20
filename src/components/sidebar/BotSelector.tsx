'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';
import { Search, ChefHat, LucideIcon, Bot, Headphones, Tags, Package, MessageCircle, Star, BarChart3, TrendingUp, FileText, Sparkles, Target, Palette, Image, Settings, ScanLine, MessageSquare } from 'lucide-react';

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
  Sparkles,
  Target,
  Palette,
  Image,
  Settings,
  ScanLine,
  MessageSquare,
};

// 图标渲染函数
const renderIcon = (iconName: string, className?: string) => {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    return <Search className={className} />; // 默认图标
  }
  return <IconComponent className={className} />;
};

// Coze机器人配置
interface CozeBot {
  id: string;
  name: string;
  description: string;
  icon: string;
  botId: string; // Coze平台的Bot ID
}

// 机器人列表配置
const COZE_BOTS: CozeBot[] = [
  {
    id: 'keyword-optimizer',
    name: '关键词优化助手',
    description: '专业的菜品关键词优化助手，为菜品名称生成优化的关键词',
    icon: 'Search',
    botId: '7432143655349338139' // 关键词优化助手的Coze Bot ID
  },
  {
    id: 'meituan-customer-service',
    name: '美团全能客服',
    description: '专业的美团客服助手，提供全方位的客户服务支持',
    icon: 'Headphones',
    botId: '7450790638439907355' // 美团全能客服的Coze Bot ID
  },
  {
    id: 'meituan-category-description',
    name: '美团分类栏描述',
    description: '智能生成店铺分类标签，优化商品展示效果',
    icon: 'Tags',
    botId: '7444769224897085503' // 美团分类栏描述的Coze Bot ID
  },
  {
    id: 'meal-combo-assistant',
    name: '外卖套餐搭配助手',
    description: '一个套餐会搭配2个菜品，并生成套餐关键词优化',
    icon: 'Package',
    botId: '7432277388740329487' // 外卖套餐搭配助手的Coze Bot ID
  },
  {
    id: 'meituan-review-assistant',
    name: '美团评价解释助手',
    description: '专业回复顾客评价，提升店铺好评率',
    icon: 'MessageCircle',
    botId: '7434355486700568591' // 美团评价解释助手的Coze Bot ID
  },
  {
    id: 'takeout-review-generator',
    name: '补单专用外卖好评',
    description: '定制个性化评价内容，增加店铺真实性',
    icon: 'Star',
    botId: '7435167383192518675' // 补单专用外卖好评的Coze Bot ID
  },
  {
    id: 'meituan-store-analyzer',
    name: '美团店铺分解析',
    description: '深度分析店铺数据，优化经营策略',
    icon: 'BarChart3',
    botId: '7441487397063245859' // 美团店铺分解析的Coze Bot ID
  },
  {
    id: 'takeout-weekly-report',
    name: '外卖数据周报分析',
    description: '智能分析周数据报表，指导经营决策',
    icon: 'TrendingUp',
    botId: '7436564709694521371' // 外卖数据周报分析的Coze Bot ID
  },
  {
    id: 'dish-description-writer',
    name: '外卖菜品描述',
    description: '能够根据菜品名称精准撰写吸引人的菜品描述',
    icon: 'FileText',
    botId: '7432146500114792487' // 外卖菜品描述的Coze Bot ID
  },
  {
    id: 'meituan-brand-story',
    name: '美团品牌故事',
    description: '输入店铺名+经营品类 自动生成品牌故事文案',
    icon: 'Sparkles',
    botId: '7488662536091811877' // 美团品牌故事的Coze Bot ID
  },
  {
    id: 'meituan-dianjin-master',
    name: '美团点金推广大师',
    description: '拥有6年推广经验，操盘过数百店铺，熟悉美团点金推广的操作手法与所有规则',
    icon: 'Target',
    botId: '7461438144458850340' // 美团点金推广大师的Coze Bot ID
  },
  {
    id: 'meituan-logo-design',
    name: '美团logo设计',
    description: '上传美团logo参考图，我能帮你生成一样的logo生成词',
    icon: 'Palette',
    botId: '7529356136379219994' // 美团logo设计的Coze Bot ID
  },
  {
    id: 'xiaohongshu-assistant',
    name: '小红书风格图文助手',
    description: '可以将任何文档内容转换成精美好看的小红书风格图文',
    icon: 'Image',
    botId: 'deepseek-chat' // DeepSeek模型
  },
  {
    id: 'coze-operation-assistant',
    name: '美团外卖代运营助手',
    description: '用简洁明了的语言向商家解释各项优化的内容、目的和好处',
    icon: 'Settings',
    botId: '7461202295062396954' // 美团外卖代运营助手的Coze Bot ID
  },
  {
    id: 'menu-price-extractor',
    name: '提取菜名和价格',
    description: '精准提取图中的菜品名称和价格',
    icon: 'ScanLine',
    botId: '7469300056269602842' // 提取菜名和价格的Coze Bot ID
  },
  {
    id: 'similar-script-generator',
    name: '相似话术生成助手',
    description: '擅长剖析各类话术，精准把握其核心要点',
    icon: 'MessageSquare',
    botId: '7498302515360825407' // 相似话术生成助手的Coze Bot ID
  },
  {
    id: 'eleme-category-description',
    name: '饿了么分类栏描述',
    description: '专注于饿了么分类栏描述生成',
    icon: 'Tags',
    botId: '7444769224897085503' // 饿了么分类栏描述的Coze Bot ID
  },
  {
    id: 'eleme-keyword-optimizer',
    name: '饿了么关键词优化',
    description: '专注于为饿了么平台产品提供关键词优化服务',
    icon: 'Search',
    botId: '7498302515360825407' // 饿了么关键词优化的Coze Bot ID
  },
  {
    id: 'eleme-dish-description',
    name: '饿了么菜品描述',
    description: '专注于饿了么撰写吸引人的菜品描述',
    icon: 'FileText',
    botId: '7432146500114792487' // 饿了么菜品描述的Coze Bot ID
  },
  {
    id: 'eleme-review-assistant',
    name: '饿了么评价解释助手',
    description: '专注于饿了么回复顾客评价，提升店铺好评率',
    icon: 'MessageCircle',
    botId: '7434355486700568591' // 饿了么评价解释助手的Coze Bot ID
  },
  {
    id: 'eleme-meal-combo',
    name: '饿了么套餐搭配助手',
    description: '一个套餐会搭配2个菜品，并生成套餐关键词优化',
    icon: 'Package',
    botId: '7540548019217776690' // 饿了么套餐搭配助手的Coze Bot ID
  }
];

interface BotSelectorProps {
  onSelectBot?: () => void; // 移动端选择后关闭侧边栏
}

export function BotSelector({ onSelectBot }: BotSelectorProps) {
  const { setSelectedModel, createNewSession, clearAllSessions } = useChatStore();
  const [selectedBotId, setSelectedBotId] = useState('keyword-optimizer');

  const handleSelectBot = (bot: CozeBot) => {
    setSelectedBotId(bot.id);

    // 清空所有会话，确保完全重新开始
    clearAllSessions();

    // 根据不同的机器人选择对应的模型ID
    const getModelId = (botId: string): string => {
      const modelMap: Record<string, string> = {
        'keyword-optimizer': 'coze',
        'meituan-customer-service': 'coze-meituan',
        'meituan-category-description': 'coze-category',
        'meal-combo-assistant': 'coze-meal-combo',
        'meituan-review-assistant': 'coze-review-assistant',
        'takeout-review-generator': 'coze-review-generator',
        'meituan-store-analyzer': 'coze-store-analyzer',
        'takeout-weekly-report': 'coze-weekly-report',
        'dish-description-writer': 'coze-dish-description',
        'meituan-brand-story': 'coze-brand-story',
        'meituan-dianjin-master': 'coze-dianjin-master',
        'meituan-logo-design': 'coze-logo-design',
        'xiaohongshu-assistant': 'deepseek-xiaohongshu',
        'coze-operation-assistant': 'coze-operation-assistant',
        'menu-price-extractor': 'coze-menu-price-extractor',
        'similar-script-generator': 'coze-similar-script',
        'eleme-category-description': 'eleme-category-description',
        'eleme-keyword-optimizer': 'eleme-keyword-optimizer',
        'eleme-dish-description': 'eleme-dish-description',
        'eleme-review-assistant': 'eleme-review-assistant',
        'eleme-meal-combo': 'eleme-meal-combo',
      };
      return modelMap[botId] || 'coze';
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
          外卖助手
        </h3>
      </div>

      <div className="space-y-1">
        {COZE_BOTS.map((bot) => (
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
            更多外卖助手即将上线...
          </p>
        </div>
      </div>
    </div>
  );
}
