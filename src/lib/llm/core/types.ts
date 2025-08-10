import type { z } from 'zod';

export interface ModelConfig {
  model?: string;
  temperature?: number;
  timeoutMs?: number;
  apiKey?: string;
}

export interface ChainConfig extends ModelConfig {
  systemPrompt?: string;
  maxTokens?: number;
}

export type RunOptions = ChainConfig;

export interface ChainDefinition<I = any, O = any> {
  id: string;
  description?: string;
  inputSchema?: z.ZodTypeAny;
  outputSchema?: z.ZodTypeAny;
  run: (input: I, options?: RunOptions) => Promise<O>;
}


