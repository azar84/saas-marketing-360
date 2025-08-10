import { getChatModel } from '@/lib/llm/providers/langchain';
import type { ModelConfig } from './types';

export function createChatModel(config: ModelConfig = {}) {
  return getChatModel({
    model: config.model,
    apiKey: config.apiKey,
    temperature: config.temperature,
    timeoutMs: config.timeoutMs,
  });
}


