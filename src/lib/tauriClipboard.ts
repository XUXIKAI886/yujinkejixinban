/**
 * Tauri 剪贴板功能集成
 *
 * 支持浏览器和 Tauri 双环境的剪贴板操作
 * 解决 Tauri 桌面应用中 Clipboard API 权限策略限制问题
 *
 * @module tauriClipboard
 */

/**
 * 检测是否在 Tauri 环境中运行
 * @returns {boolean} true=Tauri环境, false=浏览器环境
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' &&
         typeof window.__TAURI__ !== 'undefined' &&
         typeof window.__TAURI__.core !== 'undefined' &&
         typeof window.__TAURI__.core.invoke === 'function';
}

/**
 * 🎯 通用文本复制函数 - 支持浏览器和Tauri双环境
 *
 * @param {string} text - 要复制的文本内容
 * @returns {Promise<boolean>} 复制是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. 环境检测
  const isTauri = isTauriEnvironment();
  console.log('🔍 [剪贴板] 环境检测:', isTauri ? 'Tauri桌面应用' : '浏览器');

  // 2. 浏览器环境 - 使用 Clipboard API
  if (!isTauri) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ [浏览器] 文本复制成功');
      return true;
    } catch (error) {
      console.error('❌ [浏览器] 复制失败:', error);
      // 浏览器环境失败时，尝试降级方案
      return fallbackCopyToClipboard(text);
    }
  }

  // 3. Tauri环境 - 使用Tauri Clipboard API
  try {
    console.log('📋 [Tauri] 开始写入剪贴板');

    // 调用 Tauri Clipboard 插件
    await window.__TAURI__.core.invoke('plugin:clipboard-manager|write_text', {
      text: text,
    });

    console.log('✅ [Tauri] 文本复制成功');
    return true;
  } catch (error) {
    console.error('❌ [Tauri] 复制失败:', error);

    // Tauri 环境失败时，尝试降级方案
    return fallbackCopyToClipboard(text);
  }
}

/**
 * 🔄 降级方案：使用传统的 document.execCommand 方法
 * （用于 Clipboard API 不可用的情况）
 *
 * @param {string} text - 要复制的文本内容
 * @returns {boolean} 复制是否成功
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    // 创建临时 textarea 元素
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.top = '0';
    textarea.style.left = '0';
    document.body.appendChild(textarea);

    // 选中并复制
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      console.log('✅ [降级方案] 文本复制成功 (execCommand)');
      return true;
    } else {
      console.error('❌ [降级方案] execCommand 返回 false');
      return false;
    }
  } catch (error) {
    console.error('❌ [降级方案] 复制失败:', error);
    return false;
  }
}

/**
 * 🎯 从剪贴板读取文本 - 支持浏览器和Tauri双环境
 *
 * @returns {Promise<string>} 剪贴板中的文本内容
 */
export async function readFromClipboard(): Promise<string> {
  const isTauri = isTauriEnvironment();
  console.log('🔍 [剪贴板] 读取 - 环境检测:', isTauri ? 'Tauri桌面应用' : '浏览器');

  // 浏览器环境
  if (!isTauri) {
    try {
      const text = await navigator.clipboard.readText();
      console.log('✅ [浏览器] 读取剪贴板成功');
      return text;
    } catch (error) {
      console.error('❌ [浏览器] 读取剪贴板失败:', error);
      return '';
    }
  }

  // Tauri环境
  try {
    console.log('📋 [Tauri] 开始读取剪贴板');

    const text = await window.__TAURI__.core.invoke<string>('plugin:clipboard-manager|read_text');

    console.log('✅ [Tauri] 读取剪贴板成功');
    return text || '';
  } catch (error) {
    console.error('❌ [Tauri] 读取剪贴板失败:', error);
    return '';
  }
}
