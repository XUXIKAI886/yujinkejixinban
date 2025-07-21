'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  getYichangWeather, 
  getWeatherIcon, 
  formatWeatherDate, 
  formatWeatherWeek,
  type WeatherInfo 
} from '@/lib/weather';
import { Cloud, RefreshCw, ChevronDown, MapPin } from 'lucide-react';

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // 获取天气数据
  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // 检查是否从缓存获取
      const cacheKey = 'yichang_weather_cache';
      const cached = localStorage.getItem(cacheKey);
      const isUsingCache = cached && (Date.now() - JSON.parse(cached).timestamp < 30 * 60 * 1000);

      const weatherData = await getYichangWeather();
      if (weatherData) {
        setWeather(weatherData);
        setLastUpdate(new Date());
        setIsFromCache(isUsingCache);
      } else {
        setError('天气服务暂时不可用');
      }
    } catch (err) {
      setError('网络连接失败');
      console.error('天气获取错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化和定时更新
  useEffect(() => {
    fetchWeather();

    // 每2小时更新一次天气（减少API调用频率）
    const interval = setInterval(fetchWeather, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 格式化更新时间
  const formatUpdateTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 获取今日天气
  const todayWeather = weather?.casts?.[0];

  if (loading && !weather) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-600 dark:text-gray-300">加载中...</span>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchWeather}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Cloud className="h-4 w-4" />
        <span className="text-sm">天气加载失败</span>
      </Button>
    );
  }

  if (!todayWeather) {
    return null;
  }

  return (
    <div className="relative">
      {/* 主要天气显示 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <MapPin className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            宜昌
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-lg">
            {getWeatherIcon(todayWeather.dayweather)}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {todayWeather.daytemp}°
          </span>
        </div>
        
        <ChevronDown 
          className={`h-3 w-3 text-gray-500 transition-transform ${
            showDetails ? 'rotate-180' : ''
          }`} 
        />
      </Button>

      {/* 详细天气信息下拉面板 */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {/* 头部信息 */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {weather.city}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchWeather}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {lastUpdate && (
              <div className="mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  更新时间: {formatUpdateTime(lastUpdate)}
                </p>
                {isFromCache && (
                  <p className="text-xs text-blue-500 dark:text-blue-400">
                    📱 缓存数据
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 今日天气详情 */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                今日天气
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatWeatherDate(todayWeather.date)} {formatWeatherWeek(todayWeather.week)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getWeatherIcon(todayWeather.dayweather)}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {todayWeather.dayweather}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {todayWeather.daywind} {todayWeather.daypower}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {todayWeather.daytemp}°
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  夜间 {todayWeather.nighttemp}°
                </p>
              </div>
            </div>
          </div>

          {/* 未来几日天气 */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              未来天气
            </h4>
            <div className="space-y-2">
              {weather.casts.slice(1, 4).map((cast, index) => (
                <div key={cast.date} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                      {formatWeatherDate(cast.date)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                      {formatWeatherWeek(cast.week)}
                    </span>
                    <span className="text-sm">
                      {getWeatherIcon(cast.dayweather)}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {cast.dayweather}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {cast.daytemp}°
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {cast.nighttemp}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 点击外部关闭下拉面板 */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}
