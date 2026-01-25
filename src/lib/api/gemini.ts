import { Message, GeminiRequest, GeminiContent } from '@/types';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { getModelById } from '@/config/models';
import { cleanMarkdownSyntax } from './utils';

// 将OpenAI格式的消息转换为Gemini格式
export function convertToGeminiFormat(messages: Message[], systemPrompt?: string): GeminiRequest {
  const contents: GeminiContent[] = [];
  const filteredMessages = messages.filter(msg => msg.role !== 'system');

  for (const message of filteredMessages) {
    contents.push({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    });
  }

  const request: GeminiRequest = { contents };

  if (systemPrompt) {
    request.system_instruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  return request;
}

// 调用Gemini API (非流式)
export async function callGeminiAPI(
  messages: Message[],
  modelId: string
): Promise<string> {
  const model = getModelById(modelId);
  if (!model) {
    throw new Error(`未找到模型: ${modelId}`);
  }

  const requestBody = convertToGeminiFormat(messages, model.systemPrompt);

  try {
    const response = await fetch(API_ENDPOINTS.GENERATE_CONTENT(model.model), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content?.parts?.length > 0) {
        return candidate.content.parts[0].text || '';
      }
    }

    throw new Error('API响应格式不正确');
  } catch (error) {
    console.error('API调用错误:', error);
    if (error instanceof Error) throw error;
    throw new Error('API调用失败');
  }
}

// 流式调用Gemini API
export async function callGeminiAPIStream(
  messages: Message[],
  modelId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  _files?: File[]
): Promise<void> {
  try {
    const result = await callGeminiAPI(messages, modelId);
    const words = result.split('');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += words[i];
      const cleanedText = cleanMarkdownSyntax(currentText);
      onChunk(cleanedText);
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('未知错误'));
  }
}

// 测试API连接
export async function testAPIConnection(): Promise<boolean> {
  try {
    const testMessages: Message[] = [
      { id: 'test', role: 'user', content: '你好', timestamp: Date.now() }
    ];
    await callGeminiAPI(testMessages, 'general');
    return true;
  } catch (error) {
    console.error('API连接测试失败:', error);
    return false;
  }
}
