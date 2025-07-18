# 🚀 Coze API 集成完整指南

## 📋 目录

- [概述](#概述)
- [环境配置](#环境配置)
- [API配置](#api配置)
- [流式响应规范](#流式响应规范)
- [核心实现代码](#核心实现代码)
- [关键问题与解决方案](#关键问题与解决方案)
- [测试验证](#测试验证)
- [最佳实践](#最佳实践)

## 概述

本文档详细介绍了如何在React/Next.js项目中集成Coze API，实现流式对话功能。Coze API使用标准的Server-Sent Events (SSE)格式进行流式响应。

### 🎯 **核心特性**
- ✅ 支持流式响应，实时显示AI回复
- ✅ 完整的事件处理机制
- ✅ 错误处理和重试机制
- ✅ TypeScript类型安全
- ✅ 与现有聊天系统无缝集成

## 环境配置

### 1. 安装依赖

```bash
# 无需额外依赖，使用原生fetch API
# 项目已包含所需的React和TypeScript依赖
```

### 2. 环境变量配置

```bash
# .env.local
NEXT_PUBLIC_COZE_API_KEY=pat_bcAfYrlVRNzf5FSEVMEChFpK4uzrGlUZcNhhAkWUpqn89rCLHsabHzuxnFrsEPLN
NEXT_PUBLIC_COZE_BOT_ID=7432143655349338139
```

```bash
# .env.example
NEXT_PUBLIC_COZE_API_KEY=your_coze_api_key_here
NEXT_PUBLIC_COZE_BOT_ID=your_bot_id_here
```

## API配置

### 1. 配置文件 (`src/config/api.ts`)

```typescript
// Coze API配置
export const COZE_CONFIG = {
  baseUrl: 'https://api.coze.cn/v3',
  apiKey: process.env.NEXT_PUBLIC_COZE_API_KEY || 'your_api_key',
  botId: process.env.NEXT_PUBLIC_COZE_BOT_ID || 'your_bot_id',
  userId: 'user_' + Math.random().toString(36).substr(2, 9), // 生成随机用户ID
  timeout: 30000,
  maxRetries: 3
};

export const COZE_ENDPOINTS = {
  CHAT: `${COZE_CONFIG.baseUrl}/chat`,
  RETRIEVE_CHAT: (chatId: string) => `${COZE_CONFIG.baseUrl}/chat/retrieve?chat_id=${chatId}`,
  LIST_MESSAGES: (chatId: string) => `${COZE_CONFIG.baseUrl}/chat/message/list?chat_id=${chatId}`
};
```

### 2. 类型定义 (`src/types/index.ts`)

```typescript
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
  meta_data: any;
  last_error?: any;
  status: 'created' | 'in_progress' | 'completed' | 'failed' | 'requires_action';
  required_action?: any;
  usage: {
    token_count: number;
    output_count: number;
    input_count: number;
  };
}

// 扩展模型配置类型
export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
  systemPrompt?: string;
  icon?: string;
  provider?: 'gemini' | 'coze'; // API提供商
}
```

## 流式响应规范

### 📡 **SSE事件流格式**

Coze API使用标准的Server-Sent Events格式：

```
event:conversation.chat.created
data:{"id":"123","conversation_id":"456",...}

event:conversation.message.delta
data:{"id":"msg_001","content":"你好",...}

event:conversation.message.completed
data:{"id":"msg_001","content":"你好，我是AI助手",...}

event:conversation.chat.completed
data:{"id":"123","status":"completed",...}

event:done
data:"[DONE]"
```

### 🔄 **完整事件流程**

```
1. conversation.chat.created      - 对话创建
2. conversation.chat.in_progress  - 对话进行中
3. conversation.message.delta     - 流式文本片段 (多次)
4. conversation.message.completed - 消息完成
5. conversation.message.completed - verbose信息
6. conversation.message.completed - follow_up建议 (多次)
7. conversation.chat.completed    - 对话完成
8. done                          - 流结束
```

### 📝 **关键事件说明**

#### `conversation.message.delta`
```json
{
  "id": "msg_001",
  "role": "assistant", 
  "type": "answer",
  "content": "你好",
  "content_type": "text",
  "chat_id": "123"
}
```
- **特点**: 每个delta包含单个字符或词
- **处理**: 需要累积所有delta内容
- **注意**: 同一消息ID的delta需要拼接

#### `conversation.message.completed`
```json
{
  "id": "msg_001",
  "role": "assistant",
  "type": "answer", 
  "content": "你好，我是AI助手",
  "content_type": "text",
  "chat_id": "123",
  "created_at": 1752761337
}
```
- **特点**: 包含完整的最终答案
- **处理**: 可用作最终内容确认
- **类型**: `answer`(回答)、`follow_up`(建议)、`verbose`(详细信息)

## 核心实现代码

### 1. 流式API调用函数 (`src/lib/api.ts`)

```typescript
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

  const config = {
    botId: process.env.NEXT_PUBLIC_COZE_BOT_ID || '7432143655349338139',
    userId: 'user_' + Math.random().toString(36).substr(2, 9),
    endpoint: 'https://api.coze.cn/v3/chat'
  };

  console.log('🔧 配置:', config);

  try {
    // 转换消息格式
    const cozeMessages: CozeMessage[] = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      content_type: 'text'
    }));

    console.log('📋 转换后的消息格式:', cozeMessages);

    // 构建请求体
    const requestBody: CozeChatRequest = {
      bot_id: config.botId,
      user_id: config.userId,
      stream: true,
      auto_save_history: true,
      additional_messages: cozeMessages
    };

    console.log('📤 请求体:', JSON.stringify(requestBody, null, 2));
    console.log('🌐 发送请求到:', config.endpoint);

    // 发送请求
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_COZE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 响应状态:', response.status);
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API请求失败:', response.status, errorText);
      throw new Error(`Coze API请求失败: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    // 处理流式响应
    await processCozeStream(response.body, onChunk, onComplete, onError);

  } catch (error) {
    console.error('❌ Coze API调用失败:', error);
    onError(error instanceof Error ? error : new Error('未知错误'));
  }
}
```

### 2. 流式响应处理函数

```typescript
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
      console.log('📦 收到数据块:', chunk);

      // 按行处理
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

        // 处理数据行 - 关键修复：使用'data:'而不是'data: '
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
              // 处理流式文本内容 - 核心逻辑
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
                  console.log('🔄 调用onChunk回调...');
                  onChunk(accumulatedContent);
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

                // 更新累积内容为最终完整内容
                accumulatedContent = finalContent;
                onChunk(finalContent);
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
            console.error('❌ JSON解析失败:', parseError, '原始数据:', data);
            // 继续处理，不中断流
          }
        }
      }
    }

    console.log('🏁 流式响应处理完成');
    onComplete();
  } catch (error) {
    console.error('❌ 流式响应处理错误:', error);
    onError(error instanceof Error ? error : new Error('流式响应处理失败'));
  } finally {
    reader.releaseLock();
  }
}
```

## 关键问题与解决方案

### 🐛 **问题1: SSE数据格式解析错误**

**问题描述**: 流式响应无法正确解析，`onChunk`回调未被调用

**原因分析**:
- Coze API的SSE格式是 `data:{"content":"..."}`（无空格）
- 代码错误地检查 `data: `（有空格）

**解决方案**:
```typescript
// ❌ 错误的方式
if (line.startsWith('data: ')) {
  const data = line.slice(6);
}

// ✅ 正确的方式
if (line.startsWith('data:')) {
  const data = line.slice(5).trim(); // 移除'data:'并trim空格
}
```

### 🐛 **问题2: 事件类型与数据分离处理**

**问题描述**: 无法正确关联事件类型和对应的数据

**原因分析**:
- SSE格式中事件类型和数据是分开的两行
- 需要维护状态来关联事件类型和数据

**解决方案**:
```typescript
let currentEvent = ''; // 维护当前事件类型

// 处理事件类型行
if (line.startsWith('event:')) {
  currentEvent = line.slice(6).trim();
  continue;
}

// 处理数据行时使用currentEvent
if (line.startsWith('data:')) {
  // 根据currentEvent处理不同类型的数据
  if (currentEvent === 'conversation.message.delta') {
    // 处理delta消息
  }
}
```

### 🐛 **问题3: Delta消息内容累积**

**问题描述**: 每个delta只包含单个字符，需要累积完整内容

**原因分析**:
- Coze API的delta消息逐字符/词发送
- 需要按消息ID累积内容

**解决方案**:
```typescript
let accumulatedContent = '';
let currentMessageId = '';

// 处理delta消息
if (currentEvent === 'conversation.message.delta') {
  const content = messageData.content || '';
  const messageId = messageData.id || '';

  // 新消息ID时重置累积内容
  if (currentMessageId !== messageId) {
    currentMessageId = messageId;
    accumulatedContent = '';
  }

  // 累积内容
  accumulatedContent += content;
  onChunk(accumulatedContent);
}
```

### 🐛 **问题4: React状态更新问题**

**问题描述**: API调用正常但UI不更新

**解决方案**: 确保正确的状态管理链路
```typescript
// useChat Hook中
(chunk: string) => {
  console.log('🎯 useChat收到chunk:', chunk);
  updateMessage(sessionId, aiMessageId, {
    content: chunk,
    isStreaming: true
  });
},

// Store中
updateMessage: (sessionId, messageId, updates) => {
  console.log('🏪 Store updateMessage调用:', { sessionId, messageId, updates });
  // 更新逻辑...
}
```

## 测试验证

### 1. 基础连接测试

```typescript
// 测试页面: /test-coze
export default function TestCozePage() {
  const [result, setResult] = useState('');

  const testConnection = async () => {
    try {
      const response = await fetch('https://api.coze.cn/v3/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_COZE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bot_id: process.env.NEXT_PUBLIC_COZE_BOT_ID,
          user_id: 'test_user',
          stream: false,
          additional_messages: [{
            role: 'user',
            content: '测试连接',
            content_type: 'text'
          }]
        })
      });

      if (response.ok) {
        setResult('✅ 连接成功');
      } else {
        setResult(`❌ 连接失败: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ 错误: ${error.message}`);
    }
  };

  return (
    <div className="p-4">
      <button onClick={testConnection}>测试Coze连接</button>
      <div>{result}</div>
    </div>
  );
}
```

### 2. 流式响应测试

```typescript
const testStream = async () => {
  let chunks = [];

  await callCozeAPIStream(
    [{ role: 'user', content: '你好' }],
    'coze-model',
    (chunk) => {
      chunks.push(chunk);
      console.log('收到chunk:', chunk);
    },
    () => {
      console.log('流式响应完成，总chunks:', chunks.length);
    },
    (error) => {
      console.error('流式响应错误:', error);
    }
  );
};
```

### 3. 调试检查清单

**API层面检查**:
- [ ] `🚀 开始Coze流式API调用`
- [ ] `📥 响应状态: 200`
- [ ] `🎯 事件类型: conversation.message.delta`
- [ ] `📋 处理数据行，当前事件: conversation.message.delta`
- [ ] `📝 收到delta内容: xxx 累积内容: xxx`

**Hook层面检查**:
- [ ] `🎯 useChat收到chunk: xxx`
- [ ] `🎯 更新消息ID: xxx 会话ID: xxx`

**Store层面检查**:
- [ ] `🏪 Store updateMessage调用: {...}`
- [ ] `🏪 找到会话: xxx 消息数量: xxx`

## 最佳实践

### 1. 错误处理

```typescript
// 设置超时
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

const response = await fetch(endpoint, {
  signal: controller.signal,
  // ... 其他配置
});

clearTimeout(timeoutId);
```

### 2. 重试机制

```typescript
async function callCozeAPIWithRetry(messages, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callCozeAPIStream(messages, ...);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. 性能优化

```typescript
// 防抖更新UI
const debouncedUpdate = useMemo(
  () => debounce((content: string) => {
    updateMessage(sessionId, messageId, { content });
  }, 50),
  [sessionId, messageId]
);
```

### 4. 内存管理

```typescript
// 清理资源
useEffect(() => {
  return () => {
    // 取消正在进行的请求
    controller.abort();
    // 清理定时器
    clearTimeout(timeoutId);
  };
}, []);
```

---

## 📚 相关文档

- [Coze API官方文档](https://www.coze.cn/docs/developer_guides/coze_api_overview)
- [Server-Sent Events规范](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [React状态管理最佳实践](https://react.dev/learn/managing-state)

---

**最后更新**: 2025-01-17
**版本**: v1.0.0
**状态**: ✅ 已验证可用
