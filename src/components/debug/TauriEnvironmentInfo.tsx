'use client';

import { useState, useEffect } from 'react';
import { isTauriEnvironment } from '@/lib/tauriDownload';

/**
 * Tauri 环境检测组件
 * 用于调试和验证 Tauri API 是否可用
 */
export function TauriEnvironmentInfo() {
  const [envInfo, setEnvInfo] = useState({
    isTauri: false,
    hasCore: false,
    hasInvoke: false,
    tauriObject: 'undefined'
  });

  useEffect(() => {
    const checkEnvironment = () => {
      const isTauri = isTauriEnvironment();
      const hasTauriObject = typeof window !== 'undefined' && typeof window.__TAURI__ !== 'undefined';
      const hasCore = hasTauriObject && typeof window.__TAURI__?.core !== 'undefined';
      const hasInvoke = hasCore && typeof window.__TAURI__?.core?.invoke === 'function';

      setEnvInfo({
        isTauri,
        hasCore,
        hasInvoke,
        tauriObject: hasTauriObject ? 'available' : 'undefined'
      });

      // 输出到控制台
      console.log('🔍 [Tauri环境检测]', {
        'Tauri环境': isTauri ? '✅ 是' : '❌ 否',
        '__TAURI__对象': hasTauriObject ? '✅ 存在' : '❌ 不存在',
        'Core API': hasCore ? '✅ 可用' : '❌ 不可用',
        'Invoke函数': hasInvoke ? '✅ 可用' : '❌ 不可用'
      });
    };

    checkEnvironment();

    // 延迟检测（防止页面加载时API未注入）
    const timer = setTimeout(checkEnvironment, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-xs text-xs z-50">
      <h3 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">
        🔍 运行环境检测
      </h3>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">环境类型:</span>
          <span className={`font-medium ${envInfo.isTauri ? 'text-green-600' : 'text-blue-600'}`}>
            {envInfo.isTauri ? '🖥️ Tauri桌面' : '🌐 浏览器'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">__TAURI__:</span>
          <span className={envInfo.tauriObject === 'available' ? 'text-green-600' : 'text-gray-400'}>
            {envInfo.tauriObject === 'available' ? '✅ 存在' : '❌ 不存在'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Core API:</span>
          <span className={envInfo.hasCore ? 'text-green-600' : 'text-gray-400'}>
            {envInfo.hasCore ? '✅ 可用' : '❌ 不可用'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Invoke:</span>
          <span className={envInfo.hasInvoke ? 'text-green-600' : 'text-gray-400'}>
            {envInfo.hasInvoke ? '✅ 可用' : '❌ 不可用'}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          {envInfo.isTauri
            ? '✅ 下载功能将使用 Tauri API'
            : 'ℹ️ 下载功能将使用浏览器原生方法'}
        </p>
      </div>
    </div>
  );
}
