import { Message } from '@/types';
import { DEEPSEEK_CONFIG, DEEPSEEK_ENDPOINTS } from '@/config/api';
import { getModelById } from '@/config/models';
import { DeepSeekMessage, DeepSeekChatRequest } from './types';

// 将消息转换为DeepSeek格式
export function convertToDeepSeekFormat(
  messages: Message[],
  systemPrompt?: string
): DeepSeekMessage[] {
  const deepSeekMessages: DeepSeekMessage[] = [];

  if (systemPrompt) {
    deepSeekMessages.push({ role: 'system', content: systemPrompt });
  }

  messages.forEach(msg => {
    if (msg.role !== 'system') {
      deepSeekMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    }
  });

  return deepSeekMessages;
}

// 调用DeepSeek API (非流式)
export async function callDeepSeekAPI(
  messages: Message[],
  modelId: string
): Promise<string> {
  console.log('🚀 开始DeepSeek非流式API调用');

  const model = getModelById(modelId);
  if (!model) throw new Error(`未找到模型: ${modelId}`);

  const requestBody: DeepSeekChatRequest = {
    model: model.model,
    messages: convertToDeepSeekFormat(messages, model.systemPrompt),
    stream: false,
    temperature: model.temperature,
    max_tokens: model.max_tokens
  };

  const response = await fetch(DEEPSEEK_ENDPOINTS.CHAT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API请求失败: ${response.status}\n${errorText}`);
  }

  const data = await response.json();
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  throw new Error('DeepSeek API响应格式不正确');
}

// 流式调用DeepSeek API
export async function callDeepSeekAPIStream(
  messages: Message[],
  modelId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  console.log('🚀 开始DeepSeek流式API调用');

  const model = getModelById(modelId);
  if (!model) {
    onError(new Error(`未找到模型: ${modelId}`));
    return;
  }

  const requestBody: DeepSeekChatRequest = {
    model: model.model,
    messages: convertToDeepSeekFormat(messages, model.systemPrompt),
    stream: true,
    temperature: model.temperature,
    max_tokens: model.max_tokens
  };

  try {
    const response = await fetch(DEEPSEEK_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek流式API请求失败: ${response.status}\n${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法获取响应流');

    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                accumulatedContent += parsed.choices[0].delta.content;
                onChunk(accumulatedContent);
              }
            } catch (parseError) {
              console.warn('解析SSE数据失败:', parseError);
            }
          }
        }
      }
      onComplete();
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('未知错误'));
  }
}

// 测试DeepSeek API连接
export async function testDeepSeekAPIConnection(): Promise<boolean> {
  try {
    const testMessages: Message[] = [
      { id: 'test', role: 'user', content: '你好', timestamp: Date.now() }
    ];
    await callDeepSeekAPI(testMessages, 'deepseek-xiaohongshu');
    return true;
  } catch (error) {
    console.error('DeepSeek API连接测试失败:', error);
    return false;
  }
}
