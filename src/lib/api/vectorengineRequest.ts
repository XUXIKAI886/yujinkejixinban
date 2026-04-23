export interface VectorEngineRequestMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BuildVectorEngineRequestBodyInput {
  model: string;
  messages: VectorEngineRequestMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
  enableThinking?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export function buildVectorEngineRequestBody(
  input: BuildVectorEngineRequestBodyInput
) {
  const requestBody = {
    model: input.model,
    messages: input.messages,
    stream: input.stream,
    extra_body: {
      enable_thinking: input.enableThinking ?? false,
    },
  } as {
    model: string;
    messages: VectorEngineRequestMessage[];
    stream: boolean;
    temperature?: number;
    max_tokens?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    extra_body: {
      enable_thinking: boolean;
    };
  };

  if (input.temperature !== undefined) {
    requestBody.temperature = input.temperature;
  }

  if (input.max_tokens !== undefined) {
    requestBody.max_tokens = input.max_tokens;
  }

  if (input.presence_penalty !== undefined) {
    requestBody.presence_penalty = input.presence_penalty;
  }

  if (input.frequency_penalty !== undefined) {
    requestBody.frequency_penalty = input.frequency_penalty;
  }

  return requestBody;
}
