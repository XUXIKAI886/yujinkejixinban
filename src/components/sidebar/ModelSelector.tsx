'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PRESET_MODELS } from '@/config/models';
import { useChatStore } from '@/lib/store';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedModelId, setSelectedModel } = useChatStore();

  const selectedModel = PRESET_MODELS.find(model => model.id === selectedModelId) || PRESET_MODELS[0];

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="mb-3">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>选择模型</span>
        </label>
      </div>

      <Button
        variant="outline"
        className="w-full justify-between h-auto p-4 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200 shadow-sm hover:shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
            {selectedModel.icon}
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-sm text-gray-900 dark:text-white">{selectedModel.name}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
              {selectedModel.description}
            </div>
          </div>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-effect border border-white/20 dark:border-gray-700/50 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto animate-scale-in">
          {PRESET_MODELS.map((model, index) => (
            <button
              key={model.id}
              className="w-full p-4 text-left hover:bg-white/20 dark:hover:bg-gray-800/30 border-b border-white/10 dark:border-gray-700/30 last:border-b-0 transition-all duration-200 group"
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm group-hover:scale-110 transition-transform duration-200">
                    {model.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {model.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {model.description}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <span className="inline-flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        <span>温度: {model.temperature}</span>
                      </span>
                      <span className="inline-flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        <span>令牌: {model.max_tokens}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {selectedModelId === model.id && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
