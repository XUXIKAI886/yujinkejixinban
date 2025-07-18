/**
 * 🚀 Coze API 集成模板代码
 * 
 * 这个文件包含了集成Coze API所需的所有核心代码
 * 可以直接复制使用，只需要替换配置信息
 * 
 * 最后更新: 2025-01-17
 * 状态: ✅ 已验证可用
 */

// ==================== 类型定义 ====================

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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

// ==================== 配置 ====================

const COZE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_COZE_API_KEY || 'your_api_key_here',
  botId: process.env.NEXT_PUBLIC_COZE_BOT_ID || 'your_bot_id_here',
  endpoint: 'https://api.coze.cn/v3/chat',
  timeout: 30000
};

// ==================== 核心API函数 ====================

/**
 * 调用Coze API进行流式对话
 * @param messages 消息历史
 * @param modelId 模型ID（可选，用于兼容）
 * @param onChunk 接收流式内容的回调
 * @param onComplete 完成回调
 * @param onError 错误回调
 */
export async function callCozeAPIStream(
  messages: Message[],
  modelId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  console.log('🚀 开始Coze流式API调用');
  
  try {
    // 1. 转换消息格式
    const cozeMessages: CozeMessage[] = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      content_type: 'text'
    }));

    // 2. 构建请求体
    const requestBody: CozeChatRequest = {
      bot_id: COZE_CONFIG.botId,
      user_id: 'user_' + Math.random().toString(36).substr(2, 9),
      stream: true,
      auto_save_history: true,
      additional_messages: cozeMessages
    };

    console.log('📤 请求体:', JSON.stringify(requestBody, null, 2));

    // 3. 发送请求
    const response = await fetch(COZE_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Coze API请求失败: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    // 4. 处理流式响应
    await processCozeStream(response.body, onChunk, onComplete, onError);

  } catch (error) {
    console.error('❌ Coze API调用失败:', error);
    onError(error instanceof Error ? error : new Error('未知错误'));
  }
}

/**
 * 处理Coze流式响应
 * 这是核心的SSE处理逻辑
 */
async function processCozeStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const reader = body.getReader();
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
      buffer += chunk;

      // 按行处理
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        
        // 处理事件类型行
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
          console.log('🎯 事件类型:', currentEvent);
          continue;
        }
        
        // 🔑 关键修复：处理数据行（注意是'data:'不是'data: '）
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim(); // 移除'data:'并trim空格
          
          if (data === '[DONE]' || data === '"[DONE]"') {
            console.log('🏁 收到完成信号');
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            
            // 🎯 处理delta消息（核心逻辑）
            if (currentEvent === 'conversation.message.delta') {
              const messageData = parsed;
              
              if (messageData && messageData.type === 'answer' && messageData.content_type === 'text') {
                const content = messageData.content || '';
                const messageId = messageData.id || '';
                
                if (content && messageId) {
                  // 如果是新的消息ID，重置累积内容
                  if (currentMessageId !== messageId) {
                    currentMessageId = messageId;
                    accumulatedContent = '';
                  }
                  
                  // 累积内容（每个delta包含一个字符或词）
                  accumulatedContent += content;
                  console.log('📝 收到delta内容:', content, '累积内容:', accumulatedContent);
                  
                  // 🔄 调用回调更新UI
                  onChunk(accumulatedContent);
                }
              }
            }
            // 处理完成消息
            else if (currentEvent === 'conversation.message.completed') {
              const messageData = parsed;
              
              if (messageData && messageData.type === 'answer' && messageData.content_type === 'text') {
                // 确保显示最终完整内容
                const finalContent = messageData.content || '';
                console.log('✅ 最终答案:', finalContent);
                accumulatedContent = finalContent;
                onChunk(finalContent);
              }
            }
            // 处理对话完成
            else if (currentEvent === 'conversation.chat.completed') {
              console.log('🏁 对话完成');
              onComplete();
              return;
            }
            // 处理流结束
            else if (currentEvent === 'done') {
              console.log('🏁 流结束');
              onComplete();
              return;
            }
            
          } catch (parseError) {
            console.error('❌ JSON解析失败:', parseError);
            // 继续处理，不中断流
          }
        }
      }
    }
    
    onComplete();
  } catch (error) {
    console.error('❌ 流式响应处理错误:', error);
    onError(error instanceof Error ? error : new Error('流式响应处理失败'));
  } finally {
    reader.releaseLock();
  }
}

// ==================== 使用示例 ====================

/**
 * 在React组件中使用示例
 */
export function useCozeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setIsLoading(true);

    try {
      await callCozeAPIStream(
        [...messages, userMessage],
        'coze-model',
        // onChunk: 更新AI消息内容
        (chunk: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, content: chunk, isStreaming: true }
              : msg
          ));
        },
        // onComplete: 完成流式响应
        () => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, isStreaming: false }
              : msg
          ));
          setIsLoading(false);
        },
        // onError: 处理错误
        (error: Error) => {
          console.error('聊天错误:', error);
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, content: `抱歉，发生了错误: ${error.message}`, isStreaming: false }
              : msg
          ));
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
}

// ==================== 测试函数 ====================

/**
 * 测试Coze API连接
 */
export async function testCozeConnection(): Promise<boolean> {
  try {
    const response = await fetch(COZE_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bot_id: COZE_CONFIG.botId,
        user_id: 'test_user',
        stream: false,
        additional_messages: [{
          role: 'user',
          content: '测试连接',
          content_type: 'text'
        }]
      })
    });

    return response.ok;
  } catch (error) {
    console.error('连接测试失败:', error);
    return false;
  }
}

/**
 * 🔧 调试工具：打印详细的流式响应信息
 */
export function enableCozeDebugMode() {
  // 在开发环境中启用详细日志
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Coze调试模式已启用');
    console.log('📋 配置信息:', {
      endpoint: COZE_CONFIG.endpoint,
      botId: COZE_CONFIG.botId,
      hasApiKey: !!COZE_CONFIG.apiKey
    });
  }
}
