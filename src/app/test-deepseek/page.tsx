'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { testDeepSeekAPIConnection, callDeepSeekAPIStream } from '@/lib/api';

export default function TestDeepSeekPage() {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamResult, setStreamResult] = useState('');

  const testConnection = async () => {
    setIsLoading(true);
    setResult('正在测试连接...');
    
    try {
      const success = await testDeepSeekAPIConnection();
      if (success) {
        setResult('✅ DeepSeek API连接成功！');
      } else {
        setResult('❌ DeepSeek API连接失败');
      }
    } catch (error) {
      setResult(`❌ 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testStreamAPI = async () => {
    setIsLoading(true);
    setStreamResult('');
    
    const testMessages = [
      {
        id: 'test',
        role: 'user' as const,
        content: '请帮我制作一个关于"人工智能发展趋势"的小红书风格图文卡片',
        timestamp: Date.now()
      }
    ];

    try {
      await callDeepSeekAPIStream(
        testMessages,
        'deepseek-xiaohongshu',
        (chunk: string) => {
          setStreamResult(chunk);
        },
        () => {
          setIsLoading(false);
          console.log('流式响应完成');
        },
        (error: Error) => {
          setStreamResult(`❌ 流式API错误: ${error.message}`);
          setIsLoading(false);
        }
      );
    } catch (error) {
      setStreamResult(`❌ 错误: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          DeepSeek API 测试页面
        </h1>
        
        <div className="space-y-6">
          {/* 连接测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              连接测试
            </h2>
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="mb-4"
            >
              {isLoading ? '测试中...' : '测试DeepSeek连接'}
            </Button>
            {result && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {result}
                </pre>
              </div>
            )}
          </div>

          {/* 流式API测试 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              流式API测试
            </h2>
            <Button 
              onClick={testStreamAPI} 
              disabled={isLoading}
              className="mb-4"
            >
              {isLoading ? '生成中...' : '测试小红书图文生成'}
            </Button>
            {streamResult && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {streamResult}
                </pre>
              </div>
            )}
          </div>

          {/* API配置信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              API配置信息
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Base URL:</strong> https://api.deepseek.com</p>
              <p><strong>Model:</strong> deepseek-chat</p>
              <p><strong>API Key:</strong> sk-63916ff05d33451e8905948b5dcca49d</p>
              <p><strong>机器人ID:</strong> deepseek-xiaohongshu</p>
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
    </div>
  );
}
