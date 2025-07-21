// 消息类型
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  images?: File[]; // 添加图片支持
}

// 模型配置类型
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

// 对话会话类型
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  createdAt: number;
  updatedAt: number;
}

// API配置类型
export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  max_tokens: number;
  timeout: number;
}

// Gemini API请求格式
export interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiRequest {
  system_instruction?: {
    parts: Array<{ text: string }>;
  };
  contents: GeminiContent[];
}

// 应用状态类型
export interface AppState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  selectedModelId: string;
  isLoading: boolean;
  error: string | null;
}
