// API 模块统一导出入口

// 类型导出
export * from './types';

// 工具函数导出
export { cleanMarkdownSyntax, getBotIdByModel, extractSVGCode } from './utils';

// Gemini API
export {
  convertToGeminiFormat,
  callGeminiAPI,
  callGeminiAPIStream,
  testAPIConnection
} from './gemini';

// Coze API
export {
  convertToCozeFormat,
  callCozeAPI,
  callCozeAPIStream,
  testCozeAPIConnection
} from './coze';

// DeepSeek API
export {
  convertToDeepSeekFormat,
  callDeepSeekAPI,
  callDeepSeekAPIStream,
  testDeepSeekAPIConnection
} from './deepseek';

// VectorEngine API
export {
  convertToVectorEngineFormat,
  callVectorEngineAPI,
  callVectorEngineAPIStream
} from './vectorengine';

// Gemini 3.0 API
export {
  convertToGemini3NativeFormat,
  callGemini3API,
  callGemini3APIStream,
  testGemini3APIConnection
} from './gemini3';
