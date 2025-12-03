import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSession, Message, AppState } from '@/types';
import { DEFAULT_MODEL_ID } from '@/config/models';

interface ChatStore extends AppState {
  // Actions
  setCurrentSession: (session: ChatSession | null) => void;
  setSelectedModel: (modelId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Session management
  createNewSession: (modelId?: string) => ChatSession;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  deleteSession: (sessionId: string) => void;
  
  // Message management
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  clearMessages: (sessionId: string) => void;
  clearAllSessions: () => void;
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessions: [],
      selectedModelId: DEFAULT_MODEL_ID,
      isLoading: false,
      error: null,

      // Actions
      setCurrentSession: (session) => set({ currentSession: session }),
      
      setSelectedModel: (modelId) => set({ selectedModelId: modelId }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),

      // Session management
      createNewSession: (modelId = DEFAULT_MODEL_ID) => {
        const newSession: ChatSession = {
          id: generateId(),
          title: '新对话',
          messages: [],
          modelId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSession: newSession
        }));

        return newSession;
      },

      updateSession: (sessionId, updates) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, ...updates, updatedAt: Date.now() }
              : session
          );

          const updatedCurrentSession = state.currentSession?.id === sessionId
            ? { ...state.currentSession, ...updates, updatedAt: Date.now() }
            : state.currentSession;

          return {
            sessions: updatedSessions,
            currentSession: updatedCurrentSession
          };
        });
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const filteredSessions = state.sessions.filter(s => s.id !== sessionId);
          const newCurrentSession = state.currentSession?.id === sessionId
            ? (filteredSessions.length > 0 ? filteredSessions[0] : null)
            : state.currentSession;

          return {
            sessions: filteredSessions,
            currentSession: newCurrentSession
          };
        });
      },

      // Message management
      addMessage: (sessionId, messageData) => {
        const message: Message = {
          ...messageData,
          id: generateId(),
          timestamp: Date.now()
        };

        const { updateSession } = get();
        const session = get().sessions.find(s => s.id === sessionId);
        
        if (session) {
          const updatedMessages = [...session.messages, message];
          const title = session.messages.length === 0 && messageData.role === 'user'
            ? messageData.content.slice(0, 30) + (messageData.content.length > 30 ? '...' : '')
            : session.title;

          updateSession(sessionId, { 
            messages: updatedMessages,
            title
          });
        }
      },

      updateMessage: (sessionId, messageId, updates) => {
        console.log('🏪 Store updateMessage调用:', { sessionId, messageId, updates });
        const { updateSession } = get();
        const session = get().sessions.find(s => s.id === sessionId);

        if (session) {
          console.log('🏪 找到会话:', session.id, '消息数量:', session.messages.length);
          const updatedMessages = session.messages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          );

          console.log('🏪 更新后的消息:', updatedMessages.find(m => m.id === messageId));
          updateSession(sessionId, { messages: updatedMessages });
          console.log('🏪 会话更新完成');
        } else {
          console.error('🏪 未找到会话:', sessionId);
        }
      },

      clearMessages: (sessionId) => {
        const { updateSession } = get();
        updateSession(sessionId, { messages: [], title: '新对话' });
      },

      clearAllSessions: () => {
        set({
          sessions: [],
          currentSession: null
        });
      }
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        sessions: state.sessions,
        selectedModelId: state.selectedModelId
      }),
      // 数据迁移：处理旧的模型ID
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { selectedModelId?: string; sessions?: ChatSession[] };

        // 迁移旧的 deepseek-xiaohongshu 到新的 gemini3-xiaohongshu
        if (state.selectedModelId === 'deepseek-xiaohongshu') {
          state.selectedModelId = 'gemini3-xiaohongshu';
        }

        // 迁移会话中的旧模型ID
        if (state.sessions) {
          state.sessions = state.sessions.map(session => {
            if (session.modelId === 'deepseek-xiaohongshu') {
              return { ...session, modelId: 'gemini3-xiaohongshu' };
            }
            return session;
          });
        }

        return state;
      },
      version: 1
    }
  )
);
