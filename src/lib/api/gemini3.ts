import { Message } from '@/types';
import { GEMINI3_CONFIG, GEMINI3_ENDPOINTS } from '@/config/api';
import { getModelById } from '@/config/models';
import { Gemini3Content, Gemini3Request } from './types';
import { extractSVGCode } from './utils';

// 将消息转换为Gemini原生格式
export function convertToGemini3NativeFormat(
  messages: Message[],
  systemPrompt?: string
): Gemini3Request {
  const contents: Gemini3Content[] = [];
  const filteredMessages = messages.filter(msg => msg.role !== 'system');

  for (const message of filteredMessages) {
    contents.push({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    });
  }

  const request: Gemini3Request = { contents };

  if (systemPrompt) {
    request.systemInstruction = {
      role: 'user',
      parts: [{ text: systemPrompt }]
    };
  }

  return request;
}

// 调用Gemini 3.0 API (非流式)
export async function callGemini3API(
  messages: Message[],
  modelId: string
): Promise<string> {
  console.log('🚀 开始Gemini 3.0非流式API调用');

  const model = getModelById(modelId);
  if (!model) throw new Error(`未找到模型: ${modelId}`);

  const requestBody = convertToGemini3NativeFormat(messages, model.systemPrompt);
  requestBody.generationConfig = {
    temperature: model.temperature,
    maxOutputTokens: model.max_tokens
  };

  const url = `${GEMINI3_ENDPOINTS.STREAM_GENERATE}?key=${GEMINI3_CONFIG.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini 3.0 API请求失败: ${response.status}\n${errorText}`);
  }

  const data = await response.json();
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error('Gemini 3.0 API响应格式不正确');
}

// 流式调用Gemini 3.0 API
export async function callGemini3APIStream(
  messages: Message[],
  modelId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  console.log('🚀 开始Gemini 3.0流式API调用');

  const model = getModelById(modelId);
  if (!model) {
    onError(new Error(`未找到模型: ${modelId}`));
    return;
  }

  const requestBody = convertToGemini3NativeFormat(messages, model.systemPrompt);
  requestBody.generationConfig = {
    temperature: model.temperature,
    maxOutputTokens: model.max_tokens
  };

  const url = `${GEMINI3_ENDPOINTS.STREAM_GENERATE}?key=${GEMINI3_CONFIG.apiKey}&alt=sse`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini 3.0流式API请求失败: ${response.status}\n${errorText}`);
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
              if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                accumulatedContent += parsed.candidates[0].content.parts[0].text;
                onChunk(accumulatedContent);
              }
            } catch (parseError) {
              console.warn('解析数据行失败:', parseError);
            }
          }
        }
      }

      // 流结束，提取SVG代码
      if (accumulatedContent.trim()) {
        const finalContent = extractSVGCode(accumulatedContent);
        if (finalContent !== accumulatedContent) {
          onChunk(finalContent);
        }
      }
      onComplete();
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        onError(new Error('请求超时（120秒），请稍后重试'));
      } else {
        onError(error);
      }
    } else {
      onError(new Error('未知错误'));
    }
  }
}

// 测试Gemini 3.0 API连接
export async function testGemini3APIConnection(): Promise<boolean> {
  try {
    const testMessages: Message[] = [
      { id: 'test', role: 'user', content: '你好', timestamp: Date.now() }
    ];
    await callGemini3API(testMessages, 'gemini3-xiaohongshu');
    return true;
  } catch (error) {
    console.error('Gemini 3.0 API连接测试失败:', error);
    return false;
  }
}
