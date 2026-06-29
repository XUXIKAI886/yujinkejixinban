import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const botSelectorSource = readFileSync('src/components/sidebar/BotSelector.tsx', 'utf8');
const modelsSource = readFileSync('src/config/models.ts', 'utf8');

function getSidebarModelIds() {
  const mapMatch = botSelectorSource.match(/const modelMap: Record<string, string> = \{([\s\S]*?)\n\s*\};/);
  assert.ok(mapMatch, 'BotSelector modelMap should be present');

  return [...mapMatch[1].matchAll(/'[^']+':\s*'([^']+)'/g)].map((match) => match[1]);
}

function getModelBlock(modelId) {
  const blockMatch = modelsSource.match(new RegExp(`\\{\\s*id: '${modelId}'[\\s\\S]*?\\n\\s*\\},?`));
  assert.ok(blockMatch, `model config for ${modelId} should be present`);
  return blockMatch[0];
}

test('sidebar robots do not use Coze provider or Coze bot model', () => {
  const migratedModelIds = getSidebarModelIds();

  const cozeBackedModels = migratedModelIds.filter((modelId) => {
    const modelBlock = getModelBlock(modelId);
    return modelBlock.includes("provider: 'coze'") || modelBlock.includes("model: 'coze-bot'");
  });

  assert.deepEqual(cozeBackedModels, []);
});

test('sidebar Gemini3 robots use the configured Gemini3 model env var', () => {
  const migratedModelIds = getSidebarModelIds();

  const hardcodedGemini3Models = migratedModelIds.filter((modelId) => {
    const modelBlock = getModelBlock(modelId);
    return (
      modelBlock.includes("provider: 'gemini3'") &&
      !modelBlock.includes('process.env.NEXT_PUBLIC_GEMINI3_MODEL')
    );
  });

  assert.deepEqual(hardcodedGemini3Models, []);
});
