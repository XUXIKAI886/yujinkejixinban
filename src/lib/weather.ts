// 高德天气API服务
const AMAP_KEY = '634a7d92f531b9d9f0791b8c82b90fee';
const AMAP_BASE_URL = 'https://restapi.amap.com/v3/weather/weatherInfo';

// 宜昌市的城市编码
const YICHANG_CITY_CODE = '420500';

// 天气数据接口
export interface WeatherInfo {
  city: string;
  adcode: string;
  province: string;
  reporttime: string;
  casts: WeatherCast[];
}

export interface WeatherCast {
  date: string;
  week: string;
  dayweather: string;
  nightweather: string;
  daytemp: string;
  nighttemp: string;
  daywind: string;
  nightwind: string;
  daypower: string;
  nightpower: string;
  daytemp_float: string;
  nighttemp_float: string;
}

export interface WeatherResponse {
  status: string;
  count: string;
  info: string;
  infocode: string;
  forecasts: WeatherInfo[];
}

// 缓存相关
const CACHE_KEY = 'yichang_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存

interface WeatherCache {
  data: WeatherInfo;
  timestamp: number;
}

// 从缓存获取天气数据
function getWeatherFromCache(): WeatherInfo | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const cacheData: WeatherCache = JSON.parse(cached);
      const now = Date.now();

      // 检查缓存是否过期
      if (now - cacheData.timestamp < CACHE_DURATION) {
        console.log('使用缓存的天气数据');
        return cacheData.data;
      }
    }
  } catch (error) {
    console.error('读取天气缓存失败:', error);
  }
  return null;
}

// 保存天气数据到缓存
function saveWeatherToCache(data: WeatherInfo): void {
  try {
    const cacheData: WeatherCache = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('保存天气缓存失败:', error);
  }
}

// 获取宜昌天气信息
export async function getYichangWeather(): Promise<WeatherInfo | null> {
  // 首先尝试从缓存获取
  const cachedWeather = getWeatherFromCache();
  if (cachedWeather) {
    return cachedWeather;
  }

  try {
    const url = `${AMAP_BASE_URL}?key=${AMAP_KEY}&city=${YICHANG_CITY_CODE}&extensions=all`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WeatherResponse = await response.json();

    if (data.status === '1' && data.forecasts && data.forecasts.length > 0) {
      const weatherData = data.forecasts[0];
      // 保存到缓存
      saveWeatherToCache(weatherData);
      return weatherData;
    } else {
      console.error('天气API返回错误:', data.info, 'infocode:', data.infocode);

      // 如果是配额超限，返回模拟数据
      if (data.infocode === 'CUQPS_HAS_EXCEEDED_THE_LIMIT' || data.infocode === 'DAILY_QUERY_OVER_LIMIT') {
        console.log('API配额超限，使用模拟天气数据');
        return getMockWeatherData();
      }

      return null;
    }
  } catch (error) {
    console.error('获取天气信息失败:', error);

    // 网络错误时，尝试返回模拟数据
    console.log('网络错误，使用模拟天气数据');
    return getMockWeatherData();
  }
}

// 模拟天气数据（当API不可用时使用）
function getMockWeatherData(): WeatherInfo {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const formatDate = (date: Date) => {
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0');
  };

  const getWeekDay = (date: Date) => {
    return String(date.getDay() || 7);
  };

  return {
    city: '宜昌市',
    adcode: '420500',
    province: '湖北',
    reporttime: new Date().toISOString(),
    casts: [
      {
        date: formatDate(today),
        week: getWeekDay(today),
        dayweather: '多云',
        nightweather: '晴',
        daytemp: '22',
        nighttemp: '15',
        daywind: '东风',
        nightwind: '东风',
        daypower: '≤3',
        nightpower: '≤3',
        daytemp_float: '22.0',
        nighttemp_float: '15.0'
      },
      {
        date: formatDate(tomorrow),
        week: getWeekDay(tomorrow),
        dayweather: '晴',
        nightweather: '晴',
        daytemp: '25',
        nighttemp: '16',
        daywind: '南风',
        nightwind: '南风',
        daypower: '≤3',
        nightpower: '≤3',
        daytemp_float: '25.0',
        nighttemp_float: '16.0'
      },
      {
        date: formatDate(dayAfterTomorrow),
        week: getWeekDay(dayAfterTomorrow),
        dayweather: '晴间多云',
        nightweather: '多云',
        daytemp: '24',
        nighttemp: '17',
        daywind: '南风',
        nightwind: '南风',
        daypower: '≤3',
        nightpower: '≤3',
        daytemp_float: '24.0',
        nighttemp_float: '17.0'
      }
    ]
  };
}

// 天气图标映射
export const weatherIcons: Record<string, string> = {
  '晴': '☀️',
  '少云': '🌤️',
  '晴间多云': '⛅',
  '多云': '☁️',
  '阴': '☁️',
  '有风': '💨',
  '平静': '😌',
  '微风': '🍃',
  '和风': '🍃',
  '清风': '💨',
  '强风/劲风': '💨',
  '疾风': '💨',
  '大风': '💨',
  '烈风': '💨',
  '风暴': '🌪️',
  '狂爆风': '🌪️',
  '飓风': '🌪️',
  '热带风暴': '🌪️',
  '霾': '😷',
  '中度霾': '😷',
  '重度霾': '😷',
  '严重霾': '😷',
  '阵雨': '🌦️',
  '雷阵雨': '⛈️',
  '雷阵雨并伴有冰雹': '⛈️',
  '小雨': '🌧️',
  '中雨': '🌧️',
  '大雨': '🌧️',
  '暴雨': '⛈️',
  '大暴雨': '⛈️',
  '特大暴雨': '⛈️',
  '强阵雨': '🌧️',
  '强雷阵雨': '⛈️',
  '极端降雨': '⛈️',
  '毛毛雨/细雨': '🌦️',
  '雨': '🌧️',
  '小雨-中雨': '🌧️',
  '中雨-大雨': '🌧️',
  '大雨-暴雨': '⛈️',
  '暴雨-大暴雨': '⛈️',
  '大暴雨-特大暴雨': '⛈️',
  '雨雪天气': '🌨️',
  '雨夹雪': '🌨️',
  '阵雨夹雪': '🌨️',
  '冻雨': '🧊',
  '雪': '❄️',
  '阵雪': '🌨️',
  '小雪': '❄️',
  '中雪': '❄️',
  '大雪': '❄️',
  '暴雪': '❄️',
  '小雪-中雪': '❄️',
  '中雪-大雪': '❄️',
  '大雪-暴雪': '❄️',
  '浮尘': '😷',
  '扬沙': '😷',
  '沙尘暴': '😷',
  '强沙尘暴': '😷',
  '龙卷风': '🌪️',
  '雾': '🌫️',
  '浓雾': '🌫️',
  '强浓雾': '🌫️',
  '轻雾': '🌫️',
  '大雾': '🌫️',
  '特强浓雾': '🌫️',
  '热': '🔥',
  '冷': '🧊',
  '未知': '❓'
};

// 获取天气图标
export function getWeatherIcon(weather: string): string {
  return weatherIcons[weather] || weatherIcons['未知'];
}

// 格式化日期
export function formatWeatherDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

// 格式化星期
export function formatWeatherWeek(week: string): string {
  const weekMap: Record<string, string> = {
    '1': '周一',
    '2': '周二', 
    '3': '周三',
    '4': '周四',
    '5': '周五',
    '6': '周六',
    '7': '周日'
  };
  return weekMap[week] || week;
}
