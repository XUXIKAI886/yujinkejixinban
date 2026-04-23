import test from 'node:test';
import assert from 'node:assert/strict';

import { buildVectorEngineRequestBody } from '../src/lib/api/vectorengineRequest';

test('构建知识库请求体时不附带 tools 字段', () => {
  const requestBody = buildVectorEngineRequestBody({
    model: 'grok-4-20-reasoning',
    messages: [
      {
        role: 'system',
        content: '系统提示词',
      },
      {
        role: 'user',
        content: '美团外卖如何设置歇业保护？',
      },
    ],
    stream: true,
    temperature: 0.3,
    max_tokens: 512,
  });

  assert.equal(requestBody.model, 'grok-4-20-reasoning');
  assert.equal(requestBody.stream, true);
  assert.deepEqual(requestBody.extra_body, { enable_thinking: false });
  assert.ok(!('tools' in requestBody));
  assert.ok(!('tool_choice' in requestBody));
});
