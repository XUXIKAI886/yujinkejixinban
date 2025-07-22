'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SVGPreviewModal } from '@/components/chat/SVGPreviewModal';
import { containsSVG, extractSVG, validateSVG } from '@/lib/svgUtils';

export default function TestSVGPreviewPage() {
  const [showPreview, setShowPreview] = useState(false);

  // 示例SVG内容（小红书风格）
  const sampleSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fecfef;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.95" />
      <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:0.95" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="400" height="600" fill="url(#bg)"/>
  
  <!-- 装饰圆圈 -->
  <circle cx="50" cy="80" r="30" fill="#ffffff" opacity="0.3"/>
  <circle cx="350" cy="150" r="20" fill="#ffffff" opacity="0.2"/>
  <circle cx="80" cy="500" r="25" fill="#ffffff" opacity="0.25"/>
  
  <!-- 主卡片 -->
  <rect x="30" y="100" width="340" height="450" rx="20" fill="url(#cardBg)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- 标题区域 -->
  <rect x="50" y="130" width="300" height="60" rx="10" fill="#ff6b6b" opacity="0.1"/>
  <text x="200" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#333">
    🤖 AI技术发展趋势
  </text>
  <text x="200" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
    2024年最新解读
  </text>
  
  <!-- 内容区域 -->
  <text x="70" y="220" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">
    🔥 核心趋势
  </text>
  
  <!-- 趋势列表 -->
  <text x="70" y="250" font-family="Arial, sans-serif" font-size="12" fill="#555">
    • 大模型能力持续提升
  </text>
  <text x="70" y="275" font-family="Arial, sans-serif" font-size="12" fill="#555">
    • 多模态AI成为主流
  </text>
  <text x="70" y="300" font-family="Arial, sans-serif" font-size="12" fill="#555">
    • AI应用场景不断扩展
  </text>
  <text x="70" y="325" font-family="Arial, sans-serif" font-size="12" fill="#555">
    • 个性化定制需求增长
  </text>
  
  <!-- 数据展示 -->
  <rect x="70" y="350" width="260" height="80" rx="10" fill="#f8f9fa" stroke="#e9ecef" stroke-width="1"/>
  <text x="200" y="375" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">
    📊 市场数据
  </text>
  <text x="200" y="395" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
    AI市场规模预计2025年达到
  </text>
  <text x="200" y="415" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ff6b6b">
    1.8万亿美元
  </text>
  
  <!-- 底部标签 -->
  <rect x="70" y="450" width="80" height="25" rx="12" fill="#ff6b6b" opacity="0.8"/>
  <text x="110" y="467" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white">
    #AI趋势
  </text>
  
  <rect x="160" y="450" width="80" height="25" rx="12" fill="#4ecdc4" opacity="0.8"/>
  <text x="200" y="467" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white">
    #技术前沿
  </text>
  
  <rect x="250" y="450" width="80" height="25" rx="12" fill="#45b7d1" opacity="0.8"/>
  <text x="290" y="467" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white">
    #未来科技
  </text>
  
  <!-- 落款 -->
  <text x="320" y="530" font-family="Arial, sans-serif" font-size="10" fill="#999" text-anchor="end">
    呈尚策划
  </text>
</svg>`;

  const testSVGDetection = () => {
    console.log('SVG检测测试:');
    console.log('包含SVG:', containsSVG(sampleSVG));
    console.log('提取的SVG长度:', extractSVG(sampleSVG).length);
    console.log('SVG有效性:', validateSVG(sampleSVG));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          SVG预览功能测试
        </h1>
        
        <div className="space-y-6">
          {/* 功能测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              功能测试
            </h2>
            
            <div className="space-y-4">
              <Button 
                onClick={testSVGDetection}
                variant="outline"
              >
                测试SVG检测功能
              </Button>
              
              <Button 
                onClick={() => setShowPreview(true)}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                预览示例SVG
              </Button>
            </div>
          </div>

          {/* SVG代码展示 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              示例SVG代码
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {sampleSVG}
              </pre>
            </div>
          </div>

          {/* 功能说明 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              功能说明
            </h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>🔍 SVG检测:</strong> 自动检测消息中的SVG代码</p>
              <p><strong>👁️ 预览功能:</strong> 在模态框中显示SVG图像</p>
              <p><strong>📥 PNG下载:</strong> 将SVG转换为高清PNG图片下载</p>
              <p><strong>✨ 优化显示:</strong> 自动优化SVG以获得最佳显示效果</p>
              <p><strong>⚠️ 错误处理:</strong> 验证SVG有效性并提供错误提示</p>
            </div>
          </div>

          {/* 使用场景 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              使用场景
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">小红书营销</h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• 产品介绍图文</li>
                  <li>• 知识科普卡片</li>
                  <li>• 数据可视化</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">社交媒体</h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• 微信朋友圈分享</li>
                  <li>• 微博图文发布</li>
                  <li>• 抖音背景图</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 返回主页 */}
          <div className="text-center">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              返回主页
            </Button>
          </div>
        </div>
      </div>

      {/* SVG预览模态框 */}
      <SVGPreviewModal
        svgContent={sampleSVG}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
