import { APIConfig } from '@/types';

// Gemini API配置 (保留原有配置)
export const API_CONFIG: APIConfig = {
  baseUrl: 'https://haxiaiplus.cn/v1beta/models',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || 'sk-BIChztSl1gwRjl06f5DZ3J15UMnLGgEBpiJa00VHTsQeI00N',
  model: 'gemini-2.5-flash-lite-preview-06-17',
  temperature: 0.8,
  max_tokens: 16384,
  timeout: 360000
};

// Coze API配置
export const COZE_CONFIG = {
  baseUrl: 'https://api.coze.cn/v3',
  apiKey: process.env.NEXT_PUBLIC_COZE_API_KEY || 'pat_YdKv5HeqFm3QfdxjjzDS4Cy7570wirB8gno7sbR2qI8djmCYEv0wr1lRJgdMeRvN',
  botId: process.env.NEXT_PUBLIC_COZE_BOT_ID || '7432143655349338139',
  userId: 'user_' + Math.random().toString(36).substr(2, 9), // 生成随机用户ID
  timeout: 30000,
  maxRetries: 3
};

// 备用配置 - 如果主配置不工作，可以尝试这些
export const COZE_CONFIG_ALT = {
  baseUrl: 'https://api.coze.com/v3', // 国际版
  apiKey: process.env.NEXT_PUBLIC_COZE_API_KEY || 'pat_YdKv5HeqFm3QfdxjjzDS4Cy7570wirB8gno7sbR2qI8djmCYEv0wr1lRJgdMeRvN',
  botId: process.env.NEXT_PUBLIC_COZE_BOT_ID || '7432143655349338139',
  userId: 'user_' + Math.random().toString(36).substr(2, 9),
};

export const API_ENDPOINTS = {
  GENERATE_CONTENT: (model: string) => `${API_CONFIG.baseUrl}/${model}:generateContent`
};

export const COZE_ENDPOINTS = {
  CHAT: `${COZE_CONFIG.baseUrl}/chat`,
  RETRIEVE_CHAT: (chatId: string) => `${COZE_CONFIG.baseUrl}/chat/retrieve?chat_id=${chatId}`,
  LIST_MESSAGES: (chatId: string) => `${COZE_CONFIG.baseUrl}/chat/message/list?chat_id=${chatId}`
};

// DeepSeek API配置
export const DEEPSEEK_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || 'sk-63916ff05d33451e8905948b5dcca49d',
  timeout: 30000,
  maxRetries: 3
};

export const DEEPSEEK_ENDPOINTS = {
  CHAT: `${DEEPSEEK_CONFIG.baseUrl}/chat/completions`
};
