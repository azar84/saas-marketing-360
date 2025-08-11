import { createChatModel } from '@/lib/llm/core/modelFactory';
import type { ModelConfig } from '@/lib/llm/core/types';

export interface LLMModelConfig extends ModelConfig {
  defaultModel?: string;
  defaultTemperature?: number;
  defaultTimeoutMs?: number;
}

/**
 * Unified LLM Model Instance
 * Provides a single, shared LLM model that can be used across different chains and agents
 */
export class LLMModel {
  private static instance: LLMModel;
  private chatModel: any;
  private config: LLMModelConfig;

  private constructor(config: LLMModelConfig = {}) {
    this.config = {
      defaultModel: 'deepseek-chat',
      defaultTemperature: 0.2,
      defaultTimeoutMs: 60000,
      apiKey: process.env.DEEPSEEK_API_KEY,
      ...config
    };
    
    this.chatModel = createChatModel({
      model: this.config.defaultModel,
      temperature: this.config.defaultTemperature,
      timeoutMs: this.config.defaultTimeoutMs,
      apiKey: this.config.apiKey
    });
  }

  /**
   * Get singleton instance of LLMModel
   */
  public static getInstance(config?: LLMModelConfig): LLMModel {
    if (!LLMModel.instance) {
      LLMModel.instance = new LLMModel(config);
    }
    return LLMModel.instance;
  }

  /**
   * Get the chat model instance
   */
  getModel() {
    return this.chatModel;
  }

  /**
   * Call the model with a prompt
   */
  async call(prompt: string): Promise<any> {
    try {
      return await this.chatModel.call(prompt);
    } catch (error) {
      console.error('LLM Model call failed:', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMModelConfig {
    return { ...this.config };
  }

  /**
   * Update configuration and recreate model if needed
   */
  updateConfig(newConfig: Partial<LLMModelConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate chat model if core config changed
    if (newConfig.model || newConfig.temperature || newConfig.timeoutMs || newConfig.apiKey) {
      this.chatModel = createChatModel({
        model: this.config.defaultModel,
        temperature: this.config.defaultTemperature,
        timeoutMs: this.config.defaultTimeoutMs,
        apiKey: this.config.apiKey
      });
    }
  }
}

// Export convenience functions
export const llmModel = LLMModel.getInstance();

export const getLLMModel = () => LLMModel.getInstance();
export const getSharedModel = () => llmModel.getModel();
