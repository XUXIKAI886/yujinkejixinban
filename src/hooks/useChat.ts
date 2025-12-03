import { useState, useCallback } from 'react';
import { useChatStore } from '@/lib/store';
import { callGeminiAPIStream, callCozeAPIStream, callDeepSeekAPIStream, callGemini3APIStream } from '@/lib/api';
import { getModelById } from '@/config/models';

export function useChat() {
  const {
    currentSession,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    selectedModelId
  } = useChatStore();

  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!currentSession || (!content.trim() && (!files || files.length === 0))) return;

    const sessionId = currentSession.id;
    setError(null);
    setLoading(true);

    try {
      // 添加用户消息
      addMessage(sessionId, {
        role: 'user',
        content: content.trim()
      });

      // 创建AI消息占位符
      addMessage(sessionId, {
        role: 'assistant',
        content: '',
        isStreaming: true
      });

      // 获取刚创建的AI消息ID
      const updatedSessionAfterAI = useChatStore.getState().sessions.find(s => s.id === sessionId);
      if (!updatedSessionAfterAI) {
        throw new Error('会话不存在');
      }
      const aiMessageId = updatedSessionAfterAI.messages[updatedSessionAfterAI.messages.length - 1].id;

      // 获取用于API调用的消息（不包括正在流式传输的AI消息）
      const messages = updatedSessionAfterAI.messages.slice(0, -1);
      setStreamingMessageId(aiMessageId);

      // 获取当前模型配置
      const currentModel = getModelById(selectedModelId);
      const isCozeModel = currentModel?.provider === 'coze';
      const isDeepSeekModel = currentModel?.provider === 'deepseek';
      const isGemini3Model = currentModel?.provider === 'gemini3';

      // 根据模型类型选择API调用方式
      let apiCall;
      if (isCozeModel) {
        apiCall = callCozeAPIStream;
      } else if (isDeepSeekModel) {
        apiCall = callDeepSeekAPIStream;
      } else if (isGemini3Model) {
        apiCall = callGemini3APIStream;
      } else {
        apiCall = callGeminiAPIStream;
      }

      // 调用API获取流式响应
      if (isDeepSeekModel || isGemini3Model) {
        // DeepSeek API不支持文件上传，只传递基本参数
        await apiCall(
          messages,
          selectedModelId,
          // onChunk: 更新消息内容
          (chunk: string) => {
            console.log('🎯 useChat收到chunk:', chunk);
            console.log('🎯 更新消息ID:', aiMessageId, '会话ID:', sessionId);
            updateMessage(sessionId, aiMessageId, {
              content: chunk,
              isStreaming: true
            });
            console.log('🎯 消息更新完成');
          },
          // onComplete: 完成流式响应
          () => {
            updateMessage(sessionId, aiMessageId, {
              isStreaming: false
            });
            setStreamingMessageId(null);
            setLoading(false);
          },
          // onError: 处理错误
          (error: Error) => {
            console.error('聊天错误:', error);
            setError(error.message);

            // 更新消息显示错误
            updateMessage(sessionId, aiMessageId, {
              content: `抱歉，发生了错误: ${error.message}`,
              isStreaming: false
            });

            setStreamingMessageId(null);
            setLoading(false);
          }
        );
      } else {
        // Coze和Gemini API支持文件上传
        await apiCall(
          messages,
          selectedModelId,
          // onChunk: 更新消息内容
          (chunk: string) => {
            console.log('🎯 useChat收到chunk:', chunk);
            console.log('🎯 更新消息ID:', aiMessageId, '会话ID:', sessionId);
            updateMessage(sessionId, aiMessageId, {
              content: chunk,
              isStreaming: true
            });
            console.log('🎯 消息更新完成');
          },
          // onComplete: 完成流式响应
          () => {
            updateMessage(sessionId, aiMessageId, {
              isStreaming: false
            });
            setStreamingMessageId(null);
            setLoading(false);
          },
          // onError: 处理错误
          (error: Error) => {
            console.error('聊天错误:', error);
            setError(error.message);

            // 更新消息显示错误
            updateMessage(sessionId, aiMessageId, {
              content: `抱歉，发生了错误: ${error.message}`,
              isStreaming: false
            });

            setStreamingMessageId(null);
            setLoading(false);
          },
          // 传递文件参数
          files
        );
      }

    } catch (error) {
      console.error('发送消息错误:', error);
      const errorMessage = error instanceof Error ? error.message : '发送消息失败';
      setError(errorMessage);
      setLoading(false);
      setStreamingMessageId(null);
    }
  }, [currentSession, selectedModelId, addMessage, updateMessage, setLoading, setError]);

  const stopGeneration = useCallback(() => {
    if (streamingMessageId && currentSession) {
      updateMessage(currentSession.id, streamingMessageId, {
        isStreaming: false
      });
      setStreamingMessageId(null);
      setLoading(false);
    }
  }, [streamingMessageId, currentSession, updateMessage, setLoading]);

  const regenerateLastMessage = useCallback(async () => {
    if (!currentSession || currentSession.messages.length < 2) return;

    const sessionId = currentSession.id;
    const messages = currentSession.messages;
    const lastUserMessage = messages[messages.length - 2];
    const lastAiMessage = messages[messages.length - 1];

    if (lastUserMessage.role !== 'user' || lastAiMessage.role !== 'assistant') {
      return;
    }

    // 重新生成最后一条AI消息
    setError(null);
    setLoading(true);
    setStreamingMessageId(lastAiMessage.id);

    try {
      // 重置AI消息内容
      updateMessage(sessionId, lastAiMessage.id, {
        content: '',
        isStreaming: true
      });

      // 获取除了最后一条AI消息之外的所有消息
      const messagesForAPI = messages.slice(0, -1);

      await callGeminiAPIStream(
        messagesForAPI,
        selectedModelId,
        // onChunk
        (chunk: string) => {
          updateMessage(sessionId, lastAiMessage.id, {
            content: chunk,
            isStreaming: true
          });
        },
        // onComplete
        () => {
          updateMessage(sessionId, lastAiMessage.id, {
            isStreaming: false
          });
          setStreamingMessageId(null);
          setLoading(false);
        },
        // onError
        (error: Error) => {
          console.error('重新生成错误:', error);
          setError(error.message);
          
          updateMessage(sessionId, lastAiMessage.id, {
            content: `抱歉，重新生成失败: ${error.message}`,
            isStreaming: false
          });
          
          setStreamingMessageId(null);
          setLoading(false);
        }
      );

    } catch (error) {
      console.error('重新生成消息错误:', error);
      const errorMessage = error instanceof Error ? error.message : '重新生成失败';
      setError(errorMessage);
      setLoading(false);
      setStreamingMessageId(null);
    }
  }, [currentSession, selectedModelId, updateMessage, setLoading, setError]);

  return {
    sendMessage,
    stopGeneration,
    regenerateLastMessage,
    isStreaming: streamingMessageId !== null
  };
}
