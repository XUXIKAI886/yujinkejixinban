'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';
import { 
  Search, ChefHat, LucideIcon, Bot, Headphones, Tags, Package, 
  MessageCircle, Star, BarChart3, TrendingUp, FileText, Target, 
  Image, Settings, ScanLine, MessageSquare, Calendar, ChevronDown, ChevronRight
} from 'lucide-react';

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  Search, ChefHat, Headphones, Tags, Package, MessageCircle, 
  Star, BarChart3, TrendingUp, FileText, Target, Image, 
  Settings, ScanLine, MessageSquare, Calendar,
};

const renderIcon = (iconName: string, className?: string) => {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) return <Bot className={className} />;
  return <IconComponent className={className} />;
};

// 机器人配置
interface CozeBot {
  id: string;
  name: string;
  description: string;
  icon: string;
  botId: string;
  category: 'meituan' | 'eleme' | 'general';
}

// 分类配置
const CATEGORIES = {
  meituan: { label: '美团专区', icon: 'ChefHat', color: 'text-orange-500' },
  eleme: { label: '饿了么专区', icon: 'Package', color: 'text-blue-500' },
  general: { label: '通用工具', icon: 'Settings', color: 'text-emerald-500' },
};

// 机器人列表
const COZE_BOTS: CozeBot[] = [
  { id: 'meituan-category-description', name: '美团分类栏描述', description: '智能生成店铺分类标签', icon: 'Tags', botId: '7444769224897085503', category: 'meituan' },
  { id: 'meal-combo-assistant', name: '外卖套餐搭配助手', description: '套餐组合与关键词优化', icon: 'Package', botId: '7432277388740329487', category: 'meituan' },
  { id: 'meituan-review-assistant', name: '美团评价解释助手', description: '专业回复顾客评价', icon: 'MessageCircle', botId: '7434355486700568591', category: 'meituan' },
  { id: 'takeout-review-generator', name: '补单专用外卖好评', description: '定制个性化评价内容', icon: 'Star', botId: '7435167383192518675', category: 'meituan' },
  { id: 'meituan-store-analyzer', name: '美团店铺分解析', description: '深度分析店铺数据', icon: 'BarChart3', botId: '7441487397063245859', category: 'meituan' },
  { id: 'takeout-weekly-report', name: '外卖数据周报分析', description: '智能分析周数据报表', icon: 'TrendingUp', botId: '7436564709694521371', category: 'meituan' },
  { id: 'meituan-dianjin-master', name: '美团点金推广大师', description: '6年推广经验专家', icon: 'Target', botId: '7461438144458850340', category: 'meituan' },
  { id: 'coze-operation-assistant', name: '美团外卖代运营助手', description: '解释优化内容与好处', icon: 'Settings', botId: '7461202295062396954', category: 'meituan' },
  { id: 'menu-price-extractor', name: '提取菜名和价格', description: '精准提取菜单信息', icon: 'ScanLine', botId: '7469300056269602842', category: 'meituan' },
  { id: 'eleme-category-description', name: '饿了么分类栏描述', description: '饿了么分类标签生成', icon: 'Tags', botId: '7444769224897085503', category: 'eleme' },
  { id: 'eleme-review-assistant', name: '饿了么评价解释助手', description: '饿了么评价回复', icon: 'MessageCircle', botId: '7434355486700568591', category: 'eleme' },
  { id: 'eleme-meal-combo', name: '饿了么套餐搭配助手', description: '套餐组合优化', icon: 'Package', botId: '7540548019217776690', category: 'eleme' },
  { id: 'eleme-weekly-report', name: '饿了么周报', description: '运营周报生成', icon: 'Calendar', botId: '7541341177451446287', category: 'eleme' },
  { id: 'eleme-daily-report', name: '饿了么日报', description: '运营日报简报', icon: 'FileText', botId: '7541990904928862260', category: 'eleme' },
  { id: 'xiaohongshu-assistant', name: '小红书图文助手', description: '转换为小红书风格图文', icon: 'Image', botId: 'deepseek-chat', category: 'general' },
  { id: 'similar-script-generator', name: '相似话术生成助手', description: '剖析话术核心要点', icon: 'MessageSquare', botId: '7498302515360825407', category: 'general' },
  { id: 'kefu-pro', name: '在线客服助手PRO', description: '专业代运营客服', icon: 'Headphones', botId: 'gemini-3-pro-preview', category: 'general' },
  { id: 'kefu-knowledge-base', name: '外卖知识库', description: '实时更新规则解答', icon: 'FileText', botId: 'grok-4-20-reasoning', category: 'general' },
];

// 模型ID映射
const MODEL_MAP: Record<string, string> = {
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

interface BotSelectorProps {
  onSelectBot?: () => void;
}

export function BotSelector({ onSelectBot }: BotSelectorProps) {
  const { setSelectedModel, createNewSession, clearAllSessions } = useChatStore();
  const [selectedBotId, setSelectedBotId] = useState('meituan-category-description');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    meituan: true,
    eleme: true,
    general: true,
  });

  // 按分类分组
  const groupedBots = useMemo(() => {
    const filtered = searchQuery.trim()
      ? COZE_BOTS.filter(bot => 
          bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bot.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : COZE_BOTS;

    return {
      meituan: filtered.filter(b => b.category === 'meituan'),
      eleme: filtered.filter(b => b.category === 'eleme'),
      general: filtered.filter(b => b.category === 'general'),
    };
  }, [searchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSelectBot = (bot: CozeBot) => {
    setSelectedBotId(bot.id);
    clearAllSessions();
    const modelId = MODEL_MAP[bot.id] || 'general';
    setSelectedModel(modelId);
    createNewSession(modelId);
    onSelectBot?.();
  };

  const totalCount = COZE_BOTS.length;

  return (
    <div className="flex flex-col h-full">
      {/* 搜索栏 */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索助手..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input w-full pl-9 pr-4 py-2.5 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-ring transition-colors placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* 分类列表 */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map(categoryKey => {
          const category = CATEGORIES[categoryKey];
          const bots = groupedBots[categoryKey];
          const isExpanded = expandedCategories[categoryKey];
          
          if (bots.length === 0 && searchQuery) return null;

          return (
            <div key={categoryKey} className="category-group">
              {/* 分类头部 */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="category-header w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <span className={category.color}>
                    {renderIcon(category.icon, 'h-4 w-4')}
                  </span>
                  <span>{category.label}</span>
                  <span className="text-xs text-muted-foreground">({bots.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* 分类内容 */}
              <div className={`category-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
                <div className="space-y-0.5 py-1">
                  {bots.map((bot) => (
                    <Button
                      key={bot.id}
                      variant="ghost"
                      className={`bot-item w-full justify-start px-3 py-2.5 h-auto text-left rounded-lg ${
                        selectedBotId === bot.id ? 'active bg-accent text-accent-foreground' : 'text-foreground/80 hover:text-foreground'
                      }`}
                      onClick={() => handleSelectBot(bot)}
                    >
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          selectedBotId === bot.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {renderIcon(bot.icon, 'h-4 w-4')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{bot.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{bot.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部统计 */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
          <div className="status-indicator w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs text-muted-foreground font-medium">
            已集成 {totalCount} 个专业 AI 助手
          </span>
        </div>
      </div>
    </div>
  );
}
