/**
 * SVG处理工具函数
 */

// 检测文本中是否包含SVG代码
export function containsSVG(content: string): boolean {
  return /<svg[\s\S]*?<\/svg>/i.test(content);
}

// 提取SVG内容
export function extractSVG(content: string): string {
  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
  return svgMatch ? svgMatch[0] : '';
}

// 清理和标准化SVG内容
export function cleanSVGContent(svgContent: string): string {
  // 移除可能的代码块标记
  let cleaned = svgContent
    .replace(/```svg\s*/g, '')
    .replace(/```\s*$/g, '')
    .replace(/```xml\s*/g, '')
    .trim();

  // 确保SVG标签完整
  if (!cleaned.includes('<svg')) {
    return svgContent; // 如果不包含SVG标签，返回原内容
  }

  // 提取SVG内容
  const svgMatch = cleaned.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    let svg = svgMatch[0];
    
    // 确保SVG有基本的属性
    if (!svg.includes('xmlns')) {
      svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // 如果没有viewBox，尝试从width和height创建
    if (!svg.includes('viewBox')) {
      const widthMatch = svg.match(/width\s*=\s*["']?(\d+)["']?/);
      const heightMatch = svg.match(/height\s*=\s*["']?(\d+)["']?/);
      
      if (widthMatch && heightMatch) {
        const width = widthMatch[1];
        const height = heightMatch[1];
        svg = svg.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
      }
    }
    
    return svg;
  }

  return cleaned;
}

// 获取SVG的尺寸信息
export function getSVGDimensions(svgContent: string): { width: number; height: number } {
  const cleaned = cleanSVGContent(svgContent);
  
  // 尝试从viewBox获取尺寸
  const viewBoxMatch = cleaned.match(/viewBox\s*=\s*["']?[^"']*?(\d+)\s+(\d+)\s+(\d+)\s+(\d+)["']?/);
  if (viewBoxMatch) {
    return {
      width: parseInt(viewBoxMatch[3]),
      height: parseInt(viewBoxMatch[4])
    };
  }
  
  // 尝试从width和height属性获取尺寸
  const widthMatch = cleaned.match(/width\s*=\s*["']?(\d+)["']?/);
  const heightMatch = cleaned.match(/height\s*=\s*["']?(\d+)["']?/);
  
  if (widthMatch && heightMatch) {
    return {
      width: parseInt(widthMatch[1]),
      height: parseInt(heightMatch[1])
    };
  }
  
  // 默认尺寸
  return { width: 800, height: 600 };
}

// 将SVG转换为PNG Blob
export async function svgToPNG(svgContent: string, scale: number = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const cleaned = cleanSVGContent(svgContent);
      const dimensions = getSVGDimensions(cleaned);
      
      // 创建canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('无法创建canvas上下文'));
        return;
      }
      
      // 设置canvas尺寸
      canvas.width = dimensions.width * scale;
      canvas.height = dimensions.height * scale;
      ctx.scale(scale, scale);
      
      // 设置白色背景
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // 创建SVG数据URL
      const svgBlob = new Blob([cleaned], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        try {
          // 绘制图片到canvas
          ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
          
          // 转换为PNG Blob
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(svgUrl);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('无法生成PNG'));
            }
          }, 'image/png', 0.95);
        } catch (error) {
          URL.revokeObjectURL(svgUrl);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('SVG图片加载失败'));
      };
      
      img.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
}

// 下载PNG文件
export async function downloadSVGAsPNG(svgContent: string, filename?: string): Promise<void> {
  try {
    const blob = await svgToPNG(svgContent);
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `xiaohongshu-card-${Date.now()}.png`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载PNG失败:', error);
    throw error;
  }
}

// 验证SVG内容是否有效
export function validateSVG(svgContent: string): boolean {
  try {
    const cleaned = cleanSVGContent(svgContent);
    
    // 基本的SVG结构检查
    if (!cleaned.includes('<svg') || !cleaned.includes('</svg>')) {
      return false;
    }
    
    // 尝试解析为DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, 'image/svg+xml');
    
    // 检查是否有解析错误
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// 优化SVG以便更好地显示
export function optimizeSVGForDisplay(svgContent: string): string {
  let optimized = cleanSVGContent(svgContent);
  
  // 确保SVG有合适的样式
  if (!optimized.includes('style=') && !optimized.includes('<style')) {
    // 添加基本样式以确保文本可读性
    optimized = optimized.replace(
      '<svg',
      '<svg style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;"'
    );
  }
  
  return optimized;
}
