/**
 * Tauri 桌面应用下载功能集成
 *
 * 支持浏览器和 Tauri 双环境的文件下载功能
 * 参考文档：TAURI_DOWNLOAD_INTEGRATION_GUIDE.md
 *
 * @module tauriDownload
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
 * 🎯 通用图片下载函数 - 支持浏览器和Tauri双环境
 *
 * @param {string} imageDataUrl - 图片Data URL (data:image/png;base64,...)
 * @param {string} filename - 保存的文件名 (如: 'image.png')
 * @returns {Promise<boolean>} 下载是否成功
 */
export async function downloadImage(imageDataUrl: string, filename: string = 'image.png'): Promise<boolean> {
  // 1. 环境检测
  const isTauri = isTauriEnvironment();
  console.log('🔍 [下载] 环境检测:', isTauri ? 'Tauri桌面应用' : '浏览器');

  // 2. 浏览器环境 - 使用传统下载方法
  if (!isTauri) {
    try {
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('✅ [浏览器] 图片下载成功');
      return true;
    } catch (error) {
      console.error('❌ [浏览器] 下载失败:', error);
      alert('下载失败: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    }
  }

  // 3. Tauri环境 - 使用Tauri API
  try {
    console.log('🖼️ [Tauri] 开始保存图片:', filename);

    // 3.1 显示文件保存对话框
    const filePath = await window.__TAURI__.core.invoke('plugin:dialog|save', {
      options: {
        defaultPath: filename,
        title: '保存图片',
        filters: [{
          name: '图片文件',
          extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']
        }]
      }
    }) as string | null;

    // 3.2 用户取消保存
    if (!filePath) {
      console.log('⚠️ [Tauri] 用户取消了保存');
      return false;
    }

    console.log('📁 [Tauri] 选择的保存路径:', filePath);

    // 3.3 转换Base64为字节数组
    const base64Data = imageDataUrl.includes(',')
      ? imageDataUrl.split(',')[1]
      : imageDataUrl;

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log('💾 [Tauri] 准备写入文件, 大小:', bytes.length, 'bytes');

    // 3.4 写入文件 (⚠️ 注意: 必须使用3参数格式!)
    await window.__TAURI__.core.invoke(
      'plugin:fs|write_file',  // 参数1: 命令名
      bytes,                    // 参数2: 数据 (Uint8Array)
      {                         // 参数3: 配置对象
        headers: {
          path: encodeURIComponent(filePath),
          options: JSON.stringify({})
        }
      }
    );

    console.log('✅ [Tauri] 图片保存成功!');
    alert('图片保存成功!\n保存位置: ' + filePath);
    return true;

  } catch (error) {
    console.error('❌ [Tauri] 保存失败:', error);
    console.error('错误详情:', error instanceof Error ? error.message : String(error));
    alert('保存失败: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

/**
 * 🎯 通用表格下载函数 - 支持浏览器和Tauri双环境
 *
 * @param {string} csvContent - CSV格式内容
 * @param {string} filename - 保存的文件名 (如: 'data.csv')
 * @returns {Promise<boolean>} 下载是否成功
 */
export async function downloadTable(csvContent: string, filename: string = 'table.csv'): Promise<boolean> {
  // 1. 环境检测
  const isTauri = isTauriEnvironment();
  console.log('🔍 [下载] 环境检测:', isTauri ? 'Tauri桌面应用' : '浏览器');

  // 2. 浏览器环境
  if (!isTauri) {
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('✅ [浏览器] 表格下载成功');
      return true;
    } catch (error) {
      console.error('❌ [浏览器] 下载失败:', error);
      alert('下载失败: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    }
  }

  // 3. Tauri环境
  try {
    console.log('📊 [Tauri] 开始保存表格:', filename);

    // 3.1 显示文件保存对话框
    const filePath = await window.__TAURI__.core.invoke('plugin:dialog|save', {
      options: {
        defaultPath: filename,
        title: '保存表格',
        filters: [{
          name: 'CSV文件',
          extensions: ['csv']
        }, {
          name: 'Excel文件',
          extensions: ['xlsx', 'xls']
        }, {
          name: '所有文件',
          extensions: ['*']
        }]
      }
    }) as string | null;

    // 3.2 用户取消保存
    if (!filePath) {
      console.log('⚠️ [Tauri] 用户取消了保存');
      return false;
    }

    console.log('📁 [Tauri] 选择的保存路径:', filePath);

    // 3.3 转换字符串为字节数组
    const encoder = new TextEncoder();
    const bytes = encoder.encode(csvContent);

    console.log('💾 [Tauri] 准备写入文件, 大小:', bytes.length, 'bytes');

    // 3.4 写入文件
    await window.__TAURI__.core.invoke(
      'plugin:fs|write_file',
      bytes,
      {
        headers: {
          path: encodeURIComponent(filePath),
          options: JSON.stringify({})
        }
      }
    );

    console.log('✅ [Tauri] 表格保存成功!');
    alert('表格保存成功!\n保存位置: ' + filePath);
    return true;

  } catch (error) {
    console.error('❌ [Tauri] 保存失败:', error);
    console.error('错误详情:', error instanceof Error ? error.message : String(error));
    alert('保存失败: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

/**
 * 从Blob对象下载文件
 * @param {Blob} blob - 要下载的Blob对象
 * @param {string} filename - 保存的文件名
 * @returns {Promise<boolean>} 下载是否成功
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<boolean> {
  const isTauri = isTauriEnvironment();

  // 浏览器环境
  if (!isTauri) {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('下载失败:', error);
      return false;
    }
  }

  // Tauri环境 - 将Blob转换为Data URL再下载
  try {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // 根据文件类型调用对应的下载函数
    if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg') ||
        filename.endsWith('.gif') || filename.endsWith('.webp') || filename.endsWith('.svg')) {
      return await downloadImage(dataUrl, filename);
    } else {
      // 对于其他类型，先转换为文本
      const text = await blob.text();
      return await downloadTable(text, filename);
    }
  } catch (error) {
    console.error('Blob转换失败:', error);
    return false;
  }
}

/**
 * TypeScript类型扩展：为window对象添加__TAURI__类型定义
 */
declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke: (command: string, args?: unknown) => Promise<unknown>;
      };
      event?: unknown;
      path?: unknown;
      fs?: unknown;
    };
  }
}
