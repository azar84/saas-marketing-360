import { ChatDeepSeek } from "@langchain/deepseek";

export interface LangChainModelOptions {
  model?: string;
  temperature?: number;
  timeoutMs?: number;
  apiKey?: string;
}

export function getChatModel(opts: LangChainModelOptions = {}) {
  const temperature = opts.temperature ?? 0.2;
  const modelName = opts.model || "deepseek-chat";

  // Use DeepSeek API key
  const deepseekApiKey = opts.apiKey || process.env.DEEPSEEK_API_KEY;
  
  if (!deepseekApiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  // Create DeepSeek chat model with fallback models
  const createModel = (modelName: string) => new ChatDeepSeek({
    apiKey: deepseekApiKey,
    model: modelName,
    temperature: temperature,
    maxTokens: 2048,
  });

  // List of DeepSeek models to try
  const modelsToTry = [
    "deepseek-chat",
    "deepseek-coder",
    "deepseek-llm-7b-chat",
    "deepseek-llm-67b-chat"
  ];

  const chatModel = {
    async invoke(messages: Array<{ role: string; content: string }>) {
      console.log('Sending prompt to DeepSeek:', messages[messages.length - 1]?.content?.substring(0, 200) + '...');

      let lastError: Error | null = null;

      for (const currentModel of modelsToTry) {
        try {
          console.log(`Attempting to use DeepSeek model: ${currentModel}`);
          
          const deepseekModel = createModel(currentModel);
          const response = await deepseekModel.invoke(messages);
          const text = response.content?.toString() || '';
          
          console.log(`DeepSeek response received from ${currentModel}, length:`, text.length);
          
          if (text) {
            return { content: String(text) } as any;
          }
          
          throw new Error('Empty response from DeepSeek model');
          
        } catch (error) {
          console.error(`DeepSeek model ${currentModel} failed:`, error);
          lastError = error as Error;
          
          // If this is the last model to try, throw the error
          if (currentModel === modelsToTry[modelsToTry.length - 1]) {
            throw new Error(`All DeepSeek models failed. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          
          // Continue to next model
          console.log(`Trying next DeepSeek model...`);
        }
      }
      
      throw lastError || new Error('No DeepSeek models available');
    },

    // Add support for the .call() method that the chain expects
    async call(content: string) {
      console.log('Sending prompt to DeepSeek via call method:', content.substring(0, 200) + '...');
      
      // Convert single content string to messages format
      const messages = [{ role: 'user', content }];
      
      const response = await this.invoke(messages);
      return response;
    },
  };

  // Debug: log the model object to ensure methods are attached
  console.log('Created chatModel with methods:', Object.getOwnPropertyNames(chatModel));
  console.log('chatModel call method type:', typeof chatModel.call);
  console.log('chatModel invoke method type:', typeof chatModel.invoke);

  return chatModel;
}


