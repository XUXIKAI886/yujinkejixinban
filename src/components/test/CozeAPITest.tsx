'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { callCozeAPI, callCozeAPIStream, testCozeAPIConnection } from '@/lib/api';
import { Message } from '@/types';

export function CozeAPITest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [streamContent, setStreamContent] = useState<string>('');

  const testConnection = async () => {
    setLoading(true);
    setResult('');
    try {
      const isConnected = await testCozeAPIConnection();
      setResult(isConnected ? '✅ Coze API连接成功！' : '❌ Coze API连接失败');
    } catch (error) {
      setResult(`❌ 连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const testNormalAPI = async () => {
    setLoading(true);
    setResult('');
    try {
      const testMessages: Message[] = [
        {
          id: 'test-1',
          role: 'user',
          content: '你好，请简单介绍一下你自己',
          timestamp: Date.now()
        }
      ];

      const response = await callCozeAPI(testMessages, 'coze');
      setResult(`✅ 普通API调用成功:\n${response}`);
    } catch (error) {
      setResult(`❌ 普通API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const testStreamAPI = async () => {
    setLoading(true);
    setResult('');
    setStreamContent('');

    try {
      const testMessages: Message[] = [
        {
          id: 'test-2',
          role: 'user',
          content: '你好，请简单介绍一下你自己',
          timestamp: Date.now()
        }
      ];

      await callCozeAPIStream(
        testMessages,
        'coze',
        // onChunk
        (chunk: string) => {
          console.log('收到流式内容:', chunk);
          setStreamContent(chunk);
        },
        // onComplete
        () => {
          setResult('✅ 流式API调用完成');
          setLoading(false);
        },
        // onError
        (error: Error) => {
          setResult(`❌ 流式API调用失败: ${error.message}`);
          setLoading(false);
        }
      );
    } catch (error) {
      setResult(`❌ 流式API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Coze API 测试
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={testConnection}
          disabled={loading}
          className="w-full"
        >
          {loading ? '测试中...' : '测试连接'}
        </Button>
        
        <Button 
          onClick={testNormalAPI}
          disabled={loading}
          className="w-full"
        >
          {loading ? '调用中...' : '测试普通API'}
        </Button>
        
        <Button 
          onClick={testStreamAPI}
          disabled={loading}
          className="w-full"
        >
          {loading ? '流式调用中...' : '测试流式API'}
        </Button>
      </div>

      {result && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">测试结果:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {result}
          </pre>
        </div>
      )}

      {streamContent && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">流式响应内容:</h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
            {streamContent}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">配置信息:</h3>
        <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <div>Bot ID: {process.env.NEXT_PUBLIC_COZE_BOT_ID}</div>
          <div>API Key: {process.env.NEXT_PUBLIC_COZE_API_KEY ? '已配置' : '未配置'}</div>
        </div>
      </div>
    </div>
  );
}
