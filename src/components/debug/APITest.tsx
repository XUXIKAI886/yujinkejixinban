'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { testAPIConnection } from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function APITest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      const success = await testAPIConnection();
      setResult(success);
      if (!success) {
        setError('API连接失败');
      }
    } catch (err) {
      setResult(false);
      setError(err instanceof Error ? err.message : '测试失败');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">API 连接测试</h3>
      
      <div className="flex items-center space-x-4">
        <Button onClick={handleTest} disabled={testing}>
          {testing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            '测试连接'
          )}
        </Button>

        {result !== null && (
          <div className="flex items-center space-x-2">
            {result ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-600">连接成功</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-600">连接失败</span>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
