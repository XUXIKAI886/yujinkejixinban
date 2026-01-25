// API 相关的类型定义

// Coze API 类型
export interface CozeMessageContent {
  type: 'text' | 'image';
  text?: string;
  file_id?: string;
}

export interface CozeMessage {
  role: 'user' | 'assistant';
  content: string;
  content_type: 'text' | 'object_string';
}

export interface CozeChatRequest {
  bot_id: string;
  user_id: string;
  stream: boolean;
  auto_save_history: boolean;
  additional_messages: CozeMessage[];
}

export interface CozeChatResponse {
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

// DeepSeek API 类型
export interface DeepSeekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DeepSeekChatRequest {
  model: string;
  messages: DeepSeekMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

// Gemini 3.0 API 类型
export interface Gemini3Content {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface Gemini3Request {
  systemInstruction?: {
    role: 'user';
    parts: Array<{ text: string }>;
  };
  contents: Gemini3Content[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

// 流式回调类型
export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}
