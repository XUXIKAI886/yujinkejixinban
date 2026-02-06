import { COZE_CONFIG } from '@/config/api';

// 清理Markdown语法，转换为纯文本格式
export function cleanMarkdownSyntax(text: string): string {
  return text
    // 移除标题语法 ### ## #
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体语法 **text** 和 __text__
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // 移除斜体语法 *text* 和 _text_
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // 移除删除线语法 ~~text~~
    .replace(/~~(.*?)~~/g, '$1')
    // 移除代码块语法 ```
    .replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, '').replace(/```/g, '');
    })
    // 移除行内代码语法 `text`
    .replace(/`([^`]+)`/g, '$1')
    // 移除链接语法 [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片语法 ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // 移除引用语法 > text
    .replace(/^>\s+/gm, '')
    // 替换列表标记 - 为 ·
    .replace(/^-\s+/gm, '· ')
    // 替换列表标记 * 为 ·
    .replace(/^\*\s+/gm, '· ')
    // 替换列表标记 + 为 ·
    .replace(/^\+\s+/gm, '· ')
    // 替换列表标记 1. 2. 等为 1· 2·
    .replace(/^(\d+)\.\s+/gm, '$1· ')
    // 移除水平分割线 --- 或 ***
    .replace(/^[-*]{3,}$/gm, '')
    // 移除表格分隔符 |---|---|
    .replace(/^\|[\s\-\|:]+\|$/gm, '')
    // 清理表格语法，保留内容
    .replace(/^\|(.+)\|$/gm, (match, content) => {
      return content.split('|').map((cell: string) => cell.trim()).join(' | ');
    })
    // 移除多余的空行，最多保留一个空行
    .replace(/\n{3,}/g, '\n\n')
    // 清理首尾空白
    .trim();
}

// 根据模型ID获取对应的Bot ID
export function getBotIdByModel(modelId: string): string {
  console.log('🔍 getBotIdByModel 调用，输入modelId:', modelId);

  const botIdMap: Record<string, string> = {
    'coze-category': '7444769224897085503',
    'coze-meal-combo': '7432277388740329487',
    'coze-review-assistant': '7434355486700568591',
    'coze-review-generator': '7435167383192518675',
    'coze-store-analyzer': '7441487397063245859',
    'coze-weekly-report': '7436564709694521371',
    'coze-dianjin-master': '7461438144458850340',
    'coze-operation-assistant': '7461202295062396954',
    'coze-menu-price-extractor': '7469300056269602842',
    'coze-similar-script': '7498302515360825407',
    'eleme-category-description': '7444769224897085503',
    'eleme-review-assistant': '7434355486700568591',
    'eleme-meal-combo': '7540548019217776690',
    'eleme-weekly-report': '7541341177451446287',
    'eleme-daily-report': '7541990904928862260',
  };

  const resultBotId = botIdMap[modelId] || COZE_CONFIG.botId;
  console.log('🎯 getBotIdByModel 结果:', modelId, '->', resultBotId);

  return resultBotId;
}

// 提取SVG代码（去除思考过程）
export function extractSVGCode(content: string): string {
  if (content.trim().startsWith('<svg')) {
    return content;
  }

  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    console.log('🎨 提取到 SVG 代码，已过滤思考过程');
    return svgMatch[0];
  }

  if (content.includes('<svg')) {
    console.log('⚠️ SVG 代码不完整，可能正在流式传输中');
    return content;
  }

  return content;
}
