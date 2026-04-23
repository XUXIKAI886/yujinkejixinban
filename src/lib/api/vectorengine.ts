import { Message } from '@/types';
import { VECTORENGINE_CONFIG, VECTORENGINE_ENDPOINTS } from '@/config/api';
import { getModelById } from '@/config/models';
import { VectorEngineChatRequest, VectorEngineMessage } from './types';
import { buildVectorEngineRequestBody } from './vectorengineRequest';

// 将消息转换为VectorEngine(OpenAI兼容)格式
export function convertToVectorEngineFormat(
  messages: Message[],
  systemPrompt?: string
): VectorEngineMessage[] {
  const vectorMessages: VectorEngineMessage[] = [];

  if (systemPrompt) {
    vectorMessages.push({ role: 'system', content: systemPrompt });
  }

  messages.forEach(msg => {
    if (msg.role !== 'system') {
      vectorMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    }
  });

  return vectorMessages;
}

// 调用VectorEngine API (非流式)
export async function callVectorEngineAPI(
  messages: Message[],
  modelId: string
): Promise<string> {
  console.log('🚀 开始VectorEngine非流式API调用');

  const model = getModelById(modelId);
  if (!model) throw new Error(`未找到模型: ${modelId}`);
  if (!VECTORENGINE_CONFIG.apiKey) throw new Error('VectorEngine API Key未配置');

  const requestBody: VectorEngineChatRequest = buildVectorEngineRequestBody({
    model: model.model,
    messages: convertToVectorEngineFormat(messages, model.systemPrompt),
    stream: false,
    temperature: model.temperature,
    max_tokens: model.max_tokens
  });

  const response = await fetch(VECTORENGINE_ENDPOINTS.CHAT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VECTORENGINE_CONFIG.apiKey}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`VectorEngine API请求失败: ${response.status}\n${errorText}`);
  }

  const data = await response.json();
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  throw new Error('VectorEngine API响应格式不正确');
}

// 流式调用VectorEngine API
export async function callVectorEngineAPIStream(
  messages: Message[],
  modelId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  console.log('🚀 开始VectorEngine流式API调用');

  const model = getModelById(modelId);
  if (!model) {
    onError(new Error(`未找到模型: ${modelId}`));
    return;
  }
  if (!VECTORENGINE_CONFIG.apiKey) {
    onError(new Error('VectorEngine API Key未配置'));
    return;
  }

  const requestBody: VectorEngineChatRequest = buildVectorEngineRequestBody({
    model: model.model,
    messages: convertToVectorEngineFormat(messages, model.systemPrompt),
    stream: true,
    temperature: model.temperature,
    max_tokens: model.max_tokens
  });

  try {
    const response = await fetch(VECTORENGINE_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VECTORENGINE_CONFIG.apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VectorEngine流式API请求失败: ${response.status}\n${errorText}`);
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
          if (line.trim() === '' || line.startsWith(':')) continue;

          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
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
