import { Message } from '@/types';
import { COZE_CONFIG, COZE_ENDPOINTS } from '@/config/api';
import { CozeMessage, CozeMessageContent, CozeChatRequest, CozeChatResponse } from './types';
import { cleanMarkdownSyntax, getBotIdByModel } from './utils';

// 将消息转换为Coze格式
export function convertToCozeFormat(messages: Message[], fileIds?: string[]): CozeMessage[] {
  return messages
    .filter(msg => msg.role !== 'system')
    .map((msg, index) => {
      const isLastUserMessage = index === messages.length - 1 && msg.role === 'user';

      if (isLastUserMessage && fileIds && fileIds.length > 0) {
        const content: CozeMessageContent[] = [];
        content.push({ type: 'text', text: msg.content.trim() || '请分析这些文件' });
        fileIds.forEach(fileId => content.push({ type: 'image', file_id: fileId }));

        return {
          role: msg.role as 'user' | 'assistant',
          content: JSON.stringify(content),
          content_type: 'object_string' as const
        };
      }

      return {
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        content_type: 'text' as const
      };
    });
}

// 上传文件到Coze
async function uploadFileToCoze(file: File): Promise<string> {
  console.log('📤 开始上传文件到Coze:', file.name);
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.coze.cn/v1/files/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${COZE_CONFIG.apiKey}` },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`文件上传失败: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  if (result.code !== 0) {
    throw new Error(`文件上传失败: ${result.msg || '未知错误'}`);
  }

  const fileId = result.data?.id;
  if (!fileId) throw new Error('文件上传成功但无法获取文件ID');

  console.log('✅ 文件上传成功:', fileId);
  return fileId;
}

// 获取Coze对话消息
async function getCozeMessages(chatId: string): Promise<string> {
  const response = await fetch(COZE_ENDPOINTS.LIST_MESSAGES(chatId), {
    headers: {
      'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) throw new Error(`获取消息失败: ${response.status}`);

  const data = await response.json();
  if (data.data && Array.isArray(data.data)) {
    const assistantMessages = data.data
      .filter((msg: { role: string; type: string }) => msg.role === 'assistant' && msg.type === 'answer')
      .sort((a: { created_at: number }, b: { created_at: number }) => b.created_at - a.created_at);

    if (assistantMessages.length > 0) {
      return assistantMessages[0].content || '抱歉，我没有生成回复。';
    }
  }
  return '抱歉，没有找到回复消息。';
}

// 轮询获取Coze对话结果
async function pollCozeResult(chatId: string, maxAttempts: number = 30): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(COZE_ENDPOINTS.RETRIEVE_CHAT(chatId), {
      headers: {
        'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`获取对话状态失败: ${response.status}`);

    const data: CozeChatResponse = await response.json();
    if (data.status === 'completed') return await getCozeMessages(chatId);
    if (data.status === 'failed') throw new Error(`对话失败: ${data.last_error?.msg || '未知错误'}`);

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('对话超时');
}

// 调用Coze API (非流式)
export async function callCozeAPI(messages: Message[], modelId: string, files?: File[]): Promise<string> {
  console.log('🚀 开始Coze非流式API调用');

  let fileIds: string[] = [];
  if (files && files.length > 0) {
    fileIds = await Promise.all(files.map(file => uploadFileToCoze(file)));
  }

  const requestBody: CozeChatRequest = {
    bot_id: getBotIdByModel(modelId),
    user_id: COZE_CONFIG.userId,
    stream: false,
    auto_save_history: true,
    additional_messages: convertToCozeFormat(messages, fileIds)
  };

  const response = await fetch(COZE_ENDPOINTS.CHAT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Coze API请求失败: ${response.status}\n${errorText}`);
  }

  const data: CozeChatResponse = await response.json();
  if (data.status === 'failed') throw new Error(`Coze API调用失败: ${data.last_error?.msg}`);
  if (data.status === 'in_progress') return await pollCozeResult(data.id);

  return await getCozeMessages(data.id);
}

// 流式调用Coze API
export async function callCozeAPIStream(
  messages: Message[],
  modelId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  files?: File[]
): Promise<void> {
  console.log('🚀 开始Coze流式API调用');

  try {
    let fileIds: string[] = [];
    if (files && files.length > 0) {
      fileIds = await Promise.all(files.map(file => uploadFileToCoze(file)));
    }

    const requestBody: CozeChatRequest = {
      bot_id: getBotIdByModel(modelId),
      user_id: COZE_CONFIG.userId,
      stream: true,
      auto_save_history: true,
      additional_messages: convertToCozeFormat(messages, fileIds)
    };

    const response = await fetch(COZE_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Coze流式API请求失败: ${response.status}\n${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法获取响应流');

    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = '';
    let currentMessageId = '';
    let currentEvent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
            continue;
          }

          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]' || data === '"[DONE]"') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (currentEvent === 'conversation.message.delta') {
                if (parsed?.type === 'answer' && parsed?.content_type === 'text') {
                  const content = parsed.content || '';
                  const messageId = parsed.id || '';

                  if (content && messageId) {
                    if (currentMessageId !== messageId) {
                      currentMessageId = messageId;
                      accumulatedContent = '';
                    }
                    accumulatedContent += content;
                    onChunk(cleanMarkdownSyntax(accumulatedContent));
                  }
                }
              } else if (currentEvent === 'conversation.message.completed') {
                if (parsed?.type === 'answer' && parsed?.content_type === 'text') {
                  const finalContent = parsed.content || '';
                  accumulatedContent = cleanMarkdownSyntax(finalContent);
                  onChunk(accumulatedContent);
                }
              } else if (currentEvent === 'conversation.chat.completed') {
                onComplete();
                return;
              } else if (currentEvent === 'conversation.chat.failed') {
                throw new Error(parsed?.msg || '对话失败');
              }
            } catch {
              if (data && data !== '[DONE]') onChunk(data);
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

// 测试Coze API连接
export async function testCozeAPIConnection(): Promise<boolean> {
  try {
    const testMessages: Message[] = [
      { id: 'test', role: 'user', content: '你好', timestamp: Date.now() }
    ];
    await callCozeAPI(testMessages, 'coze');
    return true;
  } catch (error) {
    console.error('Coze API连接测试失败:', error);
    return false;
  }
}
