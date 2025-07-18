import { Message, GeminiRequest, GeminiContent } from '@/types';
import { API_CONFIG, API_ENDPOINTS, COZE_CONFIG, COZE_ENDPOINTS } from '@/config/api';
import { getModelById } from '@/config/models';

// 将OpenAI格式的消息转换为Gemini格式
export function convertToGeminiFormat(messages: Message[], systemPrompt?: string): GeminiRequest {
  const contents: GeminiContent[] = [];
  
  // 过滤掉系统消息，只处理用户和助手消息
  const filteredMessages = messages.filter(msg => msg.role !== 'system');
  
  for (const message of filteredMessages) {
    contents.push({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    });
  }

  const request: GeminiRequest = {
    contents
  };

  // 如果有系统提示，添加到请求中
  if (systemPrompt) {
    request.system_instruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  return request;
}

// 调用Gemini API
export async function callGeminiAPI(
  messages: Message[],
  modelId: string,
  _onChunk?: (chunk: string) => void
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
    
    // 解析Gemini API响应
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text || '';
      }
    }

    throw new Error('API响应格式不正确');
  } catch (error) {
    console.error('API调用错误:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('API调用失败');
  }
}

// 流式调用Gemini API (如果支持)
export async function callGeminiAPIStream(
  messages: Message[],
  modelId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    // 注意：当前的API可能不支持流式响应
    // 这里我们模拟流式响应的效果
    const result = await callGeminiAPI(messages, modelId);
    
    // 模拟打字机效果
    const words = result.split('');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += words[i];

      // 清理Markdown语法
      const cleanedText = cleanMarkdownSyntax(currentText);
      onChunk(cleanedText);

      // 添加小延迟来模拟流式效果
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
      {
        id: 'test',
        role: 'user',
        content: '你好',
        timestamp: Date.now()
      }
    ];

    await callGeminiAPI(testMessages, 'general');
    return true;
  } catch (error) {
    console.error('API连接测试失败:', error);
    return false;
  }
}

// ==================== Coze API 相关函数 ====================

// 清理Markdown语法，转换为纯文本格式
function cleanMarkdownSyntax(text: string): string {
  return text
    // 移除标题语法 ### ## #
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体语法 **text** 和 __text__
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // 移除斜体语法 *text* 和 _text_
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // 移除删除线语法 ~~text~~
    .replace(/~~(.*?)~~/g, '$1')
    // 移除代码块语法 ```
    .replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, '').replace(/```/g, '');
    })
    // 移除行内代码语法 `text`
    .replace(/`([^`]+)`/g, '$1')
    // 移除链接语法 [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片语法 ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // 移除引用语法 > text
    .replace(/^>\s+/gm, '')
    // 移除水平分割线 --- 或 ***
    .replace(/^[-*]{3,}$/gm, '')
    // 移除表格分隔符 |---|---|
    .replace(/^\|[\s\-\|:]+\|$/gm, '')
    // 清理表格语法，保留内容
    .replace(/^\|(.+)\|$/gm, (match, content) => {
      return content.split('|').map((cell: string) => cell.trim()).join(' | ');
    })
    // 移除多余的空行，最多保留一个空行
    .replace(/\n{3,}/g, '\n\n')
    // 清理首尾空白
    .trim();
}

// 根据模型ID获取对应的Bot ID
function getBotIdByModel(modelId: string): string {
  const botIdMap: Record<string, string> = {
    'coze': '7432143655349338139',                    // 关键词优化助手
    'coze-meituan': '7450790638439907355',           // 美团全能客服
    'coze-category': '7444769224897085503',          // 美团分类栏描述
    'coze-meal-combo': '7432277388740329487',        // 外卖套餐搭配助手(套餐2版本)
    'coze-review-assistant': '7434355486700568591',  // 美团评价解释助手
    'coze-review-generator': '7435167383192518675',  // 补单专用外卖好评
    'coze-store-analyzer': '7441487397063245859',    // 美团店铺分解析
    'coze-weekly-report': '7436564709694521371',     // 外卖数据周报分析
    'coze-dish-description': '7432146500114792487',  // 外卖菜品描述
    'coze-brand-story': '7488662536091811877',       // 美团品牌故事
  };

  return botIdMap[modelId] || COZE_CONFIG.botId; // 默认使用配置中的Bot ID
}

// Coze API 请求接口
interface CozeMessage {
  role: 'user' | 'assistant';
  content: string;
  content_type: 'text';
}

interface CozeChatRequest {
  bot_id: string;
  user_id: string;
  stream: boolean;
  auto_save_history: boolean;
  additional_messages: CozeMessage[];
}



interface CozeChatResponse {
  id: string;
  conversation_id: string;
  bot_id: string;
  created_at: number;
  completed_at: number;
  failed_at?: number;
  meta_data: Record<string, unknown>;
  last_error?: { code?: string; msg?: string };
  status: 'created' | 'in_progress' | 'completed' | 'failed' | 'requires_action';
  required_action?: Record<string, unknown>;
  usage: {
    token_count: number;
    output_count: number;
    input_count: number;
  };
}

// 将消息转换为Coze格式
export function convertToCozeFormat(messages: Message[]): CozeMessage[] {
  return messages
    .filter(msg => msg.role !== 'system') // 过滤系统消息
    .map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      content_type: 'text' as const
    }));
}

// 调用Coze API (非流式)
export async function callCozeAPI(
  messages: Message[],
  modelId: string
): Promise<string> {
  console.log('🚀 开始Coze非流式API调用');
  console.log('📝 消息:', messages);

  const cozeMessages = convertToCozeFormat(messages);
  console.log('📋 转换后的消息格式:', cozeMessages);

  const requestBody: CozeChatRequest = {
    bot_id: getBotIdByModel(modelId),
    user_id: COZE_CONFIG.userId,
    stream: false,
    auto_save_history: true,
    additional_messages: cozeMessages
  };

  console.log('📤 请求体:', JSON.stringify(requestBody, null, 2));

  try {
    console.log('🌐 发送请求到:', COZE_ENDPOINTS.CHAT);
    const response = await fetch(COZE_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Coze API Error:', response.status, errorText);
      throw new Error(`Coze API请求失败: ${response.status} ${response.statusText}\n错误详情: ${errorText}`);
    }

    const data: CozeChatResponse = await response.json();
    console.log('📊 响应数据:', data);

    if (data.status === 'failed') {
      throw new Error(`Coze API调用失败: ${data.last_error?.msg || '未知错误'}`);
    }

    // 如果对话还在进行中，需要轮询获取结果
    if (data.status === 'in_progress') {
      console.log('⏳ 对话进行中，开始轮询结果...');
      return await pollCozeResult(data.id);
    }

    // 获取对话消息
    console.log('📨 获取对话消息...');
    return await getCozeMessages(data.id);
  } catch (error) {
    console.error('❌ Coze API调用错误:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Coze API调用失败');
  }
}

// 轮询获取Coze对话结果
async function pollCozeResult(chatId: string, maxAttempts: number = 30): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(COZE_ENDPOINTS.RETRIEVE_CHAT(chatId), {
        headers: {
          'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`获取对话状态失败: ${response.status}`);
      }

      const data: CozeChatResponse = await response.json();

      if (data.status === 'completed') {
        return await getCozeMessages(chatId);
      } else if (data.status === 'failed') {
        throw new Error(`对话失败: ${data.last_error?.msg || '未知错误'}`);
      }

      // 等待2秒后重试
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new Error('对话超时');
}

// 获取Coze对话消息
async function getCozeMessages(chatId: string): Promise<string> {
  try {
    const response = await fetch(COZE_ENDPOINTS.LIST_MESSAGES(chatId), {
      headers: {
        'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`获取消息失败: ${response.status}`);
    }

    const data = await response.json();

    // 查找最后一条助手回复
    if (data.data && Array.isArray(data.data)) {
      const assistantMessages = data.data
        .filter((msg: { role: string; type: string }) => msg.role === 'assistant' && msg.type === 'answer')
        .sort((a: { created_at: number }, b: { created_at: number }) => b.created_at - a.created_at);

      if (assistantMessages.length > 0) {
        return assistantMessages[0].content || '抱歉，我没有生成回复。';
      }
    }

    return '抱歉，没有找到回复消息。';
  } catch (error) {
    console.error('获取Coze消息错误:', error);
    throw new Error('获取回复消息失败');
  }
}

// 流式调用Coze API
export async function callCozeAPIStream(
  messages: Message[],
  modelId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  console.log('🚀 开始Coze流式API调用');
  console.log('📝 消息:', messages);
  console.log('🔧 配置:', {
    botId: COZE_CONFIG.botId,
    userId: COZE_CONFIG.userId,
    endpoint: COZE_ENDPOINTS.CHAT
  });

  const cozeMessages = convertToCozeFormat(messages);
  console.log('📋 转换后的消息格式:', cozeMessages);

  const requestBody: CozeChatRequest = {
    bot_id: getBotIdByModel(modelId),
    user_id: COZE_CONFIG.userId,
    stream: true,
    auto_save_history: true,
    additional_messages: cozeMessages
  };

  console.log('📤 请求体:', JSON.stringify(requestBody, null, 2));

  try {
    console.log('🌐 发送请求到:', COZE_ENDPOINTS.CHAT);
    const response = await fetch(COZE_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 响应状态:', response.status, response.statusText);
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Coze Stream API Error:', response.status, errorText);
      throw new Error(`Coze流式API请求失败: ${response.status} ${response.statusText}\n错误详情: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = ''; // 累积的内容
    let currentMessageId = ''; // 当前消息ID
    let currentEvent = ''; // 当前事件类型

    console.log('📡 开始读取流式响应...');

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('✅ 流式响应读取完成');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('📦 收到数据块:', chunk);
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          console.log('📄 处理行:', line);

          // 处理事件类型行
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
            console.log('🎯 事件类型:', currentEvent);
            continue;
          }

          // 处理数据行
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim(); // 移除'data:'并trim空格
            console.log('📋 处理数据行，当前事件:', currentEvent, '数据长度:', data.length);

            if (data === '[DONE]' || data === '"[DONE]"') {
              console.log('🏁 收到完成信号');
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              console.log('📊 解析的数据:', parsed, '事件类型:', currentEvent);

              // 根据Coze API文档处理不同的事件类型
              if (currentEvent === 'conversation.chat.created') {
                console.log('🎯 对话创建:', parsed);
              } else if (currentEvent === 'conversation.chat.in_progress') {
                console.log('⏳ 对话进行中:', parsed);
              } else if (currentEvent === 'conversation.message.delta') {
                // 处理流式文本内容
                const messageData = parsed;
                console.log('🔍 Delta消息数据:', messageData);
                console.log('🔍 消息类型:', messageData?.type, '内容类型:', messageData?.content_type);

                if (messageData && messageData.type === 'answer' && messageData.content_type === 'text') {
                  const content = messageData.content || '';
                  const messageId = messageData.id || '';

                  console.log('🔍 提取的内容:', content, '消息ID:', messageId);

                  if (content && messageId) {
                    // 如果是新的消息ID，重置累积内容
                    if (currentMessageId !== messageId) {
                      console.log('🆕 新消息ID，重置累积内容');
                      currentMessageId = messageId;
                      accumulatedContent = '';
                    }

                    // 累积内容（每个delta包含一个字符或词）
                    accumulatedContent += content;
                    console.log('📝 收到delta内容:', content, '累积内容:', accumulatedContent);

                    // 清理Markdown语法
                    const cleanedContent = cleanMarkdownSyntax(accumulatedContent);
                    console.log('🧹 清理后的内容:', cleanedContent);
                    console.log('🔄 调用onChunk回调...');
                    onChunk(cleanedContent);
                  } else {
                    console.log('⚠️ 内容或消息ID为空:', { content, messageId });
                  }
                } else {
                  console.log('⚠️ 消息类型不匹配或数据为空');
                }
              } else if (currentEvent === 'conversation.message.completed') {
                // 处理完成的消息
                const messageData = parsed;
                console.log('📋 消息完成:', messageData);

                if (messageData && messageData.type === 'answer' && messageData.content_type === 'text') {
                  // 这是最终的完整答案，确保显示完整内容
                  const finalContent = messageData.content || '';
                  console.log('✅ 最终答案:', finalContent);

                  // 清理Markdown语法
                  const cleanedFinalContent = cleanMarkdownSyntax(finalContent);
                  console.log('🧹 清理后的最终答案:', cleanedFinalContent);

                  // 更新累积内容为最终完整内容
                  accumulatedContent = cleanedFinalContent;
                  onChunk(cleanedFinalContent);
                } else if (messageData && messageData.type === 'follow_up') {
                  // 建议问题，可以忽略或单独处理
                  console.log('💡 建议问题:', messageData.content);
                } else if (messageData && messageData.type === 'verbose') {
                  // 详细信息，通常表示生成完成
                  console.log('🔍 详细信息:', messageData.content);
                }
              } else if (currentEvent === 'conversation.chat.completed') {
                console.log('🏁 对话完成:', parsed);
                onComplete();
                return;
              } else if (currentEvent === 'conversation.chat.failed') {
                console.error('❌ 对话失败:', parsed);
                throw new Error(parsed?.msg || '对话失败');
              } else if (currentEvent === 'done') {
                console.log('🏁 流结束');
                onComplete();
                return;
              } else {
                console.log('ℹ️ 其他事件类型:', currentEvent, parsed);
              }
            } catch (parseError) {
              console.warn('⚠️ 解析SSE数据失败:', parseError, 'Data:', data);
              // 如果不是JSON格式，可能是纯文本内容
              if (data && data !== '[DONE]') {
                onChunk(data);
              }
            }
          }
        }
      }

      console.log('🏁 流式响应处理完成');
      onComplete();
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('❌ Coze流式API调用错误:', error);
    onError(error instanceof Error ? error : new Error('未知错误'));
  }
}

// 测试Coze API连接
export async function testCozeAPIConnection(): Promise<boolean> {
  try {
    const testMessages: Message[] = [
      {
        id: 'test',
        role: 'user',
        content: '你好',
        timestamp: Date.now()
      }
    ];

    await callCozeAPI(testMessages, 'coze');
    return true;
  } catch (error) {
    console.error('Coze API连接测试失败:', error);
    return false;
  }
}
