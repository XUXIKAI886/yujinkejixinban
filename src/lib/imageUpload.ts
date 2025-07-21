/**
 * 图片上传服务
 * 将图片上传到免费图床服务并返回URL
 */

// 使用imgbb作为免费图床服务
const IMGBB_API_KEY = 'your_imgbb_api_key'; // 需要替换为实际的API密钥
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

// 备用方案：使用sm.ms图床
const SMMS_UPLOAD_URL = 'https://sm.ms/api/v2/upload';

/**
 * 将图片文件转换为Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除data:image/...;base64,前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 上传图片到imgbb
 */
async function uploadToImgbb(file: File): Promise<string> {
  try {
    const base64 = await fileToBase64(file);
    
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64);
    formData.append('name', file.name);

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data.url;
    } else {
      throw new Error(result.error?.message || '上传失败');
    }
  } catch (error) {
    console.error('imgbb上传失败:', error);
    throw error;
  }
}

/**
 * 上传图片到sm.ms (备用方案)
 */
async function uploadToSmms(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('smfile', file);

    const response = await fetch(SMMS_UPLOAD_URL, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data.url;
    } else {
      throw new Error(result.message || '上传失败');
    }
  } catch (error) {
    console.error('sm.ms上传失败:', error);
    throw error;
  }
}

/**
 * 使用浏览器的临时URL (本地预览)
 * 注意：这个URL只能在当前浏览器会话中使用
 */
function createTempUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * 主要的图片上传函数
 * 尝试多个图床服务，如果都失败则使用临时URL
 */
export async function uploadImage(file: File): Promise<{url: string, isTemp: boolean}> {
  console.log('🖼️ 开始上传图片:', file.name);
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    throw new Error('只支持图片文件');
  }

  // 验证文件大小 (限制为5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('图片文件不能超过5MB');
  }

  // 首先尝试上传到图床服务
  try {
    // 尝试sm.ms (免费，无需API密钥)
    const url = await uploadToSmms(file);
    console.log('✅ 图片上传成功 (sm.ms):', url);
    return { url, isTemp: false };
  } catch (error) {
    console.warn('sm.ms上传失败，尝试其他方案:', error);
  }

  // 如果图床上传失败，使用临时URL作为备用方案
  console.log('⚠️ 图床上传失败，使用临时URL');
  const tempUrl = createTempUrl(file);
  return { url: tempUrl, isTemp: true };
}

/**
 * 批量上传图片
 */
export async function uploadImages(files: File[]): Promise<{url: string, isTemp: boolean, fileName: string}[]> {
  const results = [];
  
  for (const file of files) {
    try {
      const result = await uploadImage(file);
      results.push({
        ...result,
        fileName: file.name
      });
    } catch (error) {
      console.error('上传图片失败:', file.name, error);
      // 即使单个图片失败，也继续处理其他图片
      results.push({
        url: createTempUrl(file),
        isTemp: true,
        fileName: file.name
      });
    }
  }
  
  return results;
}

/**
 * 清理临时URL
 */
export function cleanupTempUrls(urls: string[]) {
  urls.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
}
