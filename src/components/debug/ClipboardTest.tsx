'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { copyToClipboard, readFromClipboard, isTauriEnvironment } from '@/lib/tauriClipboard';
import { Copy, Clipboard } from 'lucide-react';

/**
 * 剪贴板功能测试组件
 * 用于测试 Tauri 和浏览器环境下的剪贴板功能
 */
export function ClipboardTest() {
  const [testText, setTestText] = useState('测试文本：这是一段用于测试剪贴板功能的文本 🎉');
  const [readText, setReadText] = useState('');
  const [status, setStatus] = useState('');
  const isTauri = isTauriEnvironment();

  const handleCopy = async () => {
    setStatus('复制中...');
    const success = await copyToClipboard(testText);
    setStatus(success ? '✅ 复制成功！' : '❌ 复制失败');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleRead = async () => {
    setStatus('读取中...');
    const text = await readFromClipboard();
    setReadText(text);
    setStatus(text ? '✅ 读取成功！' : '⚠️ 剪贴板为空');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="fixed bottom-20 right-4 w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
      <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-white">
        📋 剪贴板测试工具
      </h3>

      <div className="space-y-3">
        {/* 环境显示 */}
        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <span className="font-semibold">当前环境：</span>
          <span className={isTauri ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
            {isTauri ? '🖥️ Tauri 桌面应用' : '🌐 浏览器'}
          </span>
        </div>

        {/* 测试输入 */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
            测试文本：
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
            rows={3}
          />
        </div>

        {/* 复制按钮 */}
        <Button
          onClick={handleCopy}
          className="w-full text-xs"
          size="sm"
        >
          <Copy className="h-3 w-3 mr-1" />
          复制到剪贴板
        </Button>

        {/* 读取按钮 */}
        <Button
          onClick={handleRead}
          variant="outline"
          className="w-full text-xs"
          size="sm"
        >
          <Clipboard className="h-3 w-3 mr-1" />
          从剪贴板读取
        </Button>

        {/* 读取结果 */}
        {readText && (
          <div className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <div className="text-gray-600 dark:text-gray-400 mb-1">读取内容：</div>
            <div className="text-gray-800 dark:text-white break-words">
              {readText}
            </div>
          </div>
        )}

        {/* 状态显示 */}
        {status && (
          <div className="text-xs text-center py-1 px-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
