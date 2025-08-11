# Unified LLM Architecture

## Overview

The system now uses a unified LLM service (`LLMService`) that provides consistent LLM interactions across all components. This eliminates the need for each component to create its own LLM instances and ensures consistent configuration and error handling.

## Architecture Benefits

1. **Single Source of Truth**: One service manages all LLM interactions
2. **Consistent Configuration**: Default settings applied across all components
3. **Centralized Error Handling**: Unified error handling and logging
4. **Easy Maintenance**: Update LLM configuration in one place
5. **Resource Efficiency**: Reuse LLM connections and configurations
6. **Type Safety**: Consistent interfaces across all LLM interactions

## Core Components

### LLMService Class

The main service class that handles all LLM interactions:

```typescript
import { LLMService, llmService } from '@/lib/llm/service';

// Get singleton instance
const service = LLMService.getInstance();

// Or use convenience export
const response = await llmService.process({ prompt: "Hello" });
```

### Key Methods

#### `process(request: LLMRequest)`
Basic LLM processing with customizable parameters:

```typescript
const response = await llmService.process({
  prompt: "Analyze this company data...",
  systemPrompt: "You are a business analyst...",
  temperature: 0.3,
  maxTokens: 1000,
  model: "deepseek-chat"
});
```

#### `processStructured<T>(request)`
Process with structured JSON output:

```typescript
const data = await llmService.processStructured<CompanyData>({
  prompt: "Extract company information...",
  outputSchema: `{
    "name": "string",
    "industry": "string"
  }`
});
```

#### `processWithModel(request, model)`
Process with a specific model:

```typescript
const response = await llmService.processWithModel(
  { prompt: "Generate keywords..." },
  "deepseek-coder"
);
```

## Usage Examples

### 1. Enrichment Processor

```typescript
// Before (old way)
const chatModel = createChatModel(config);
const response = await chatModel.call(prompt);

// After (unified way)
const response = await llmService.process({
  prompt,
  systemPrompt: 'You are a business intelligence analyst...',
  temperature: 0.2
});
```

### 2. Google Search Parser

```typescript
// Before (old way)
const model = createChatModel(options);
const response = await model.call(content);

// After (unified way)
const response = await llmService.process({
  prompt: content,
  systemPrompt: 'You are a business intelligence analyst...',
  temperature: options?.temperature ?? 0.2
});
```

### 3. Keywords Generation

```typescript
// Before (old way)
const chat = createChatModel({ model, temperature, apiKey, timeoutMs });
const resp = await chat.invoke([...]);

// After (unified way)
const response = await llmService.process({
  prompt: content,
  systemPrompt: 'You must return strict JSON...',
  temperature,
  model
});
```

## Configuration

### Default Settings

```typescript
const config: LLMServiceConfig = {
  defaultSystemPrompt: 'You are a helpful AI assistant.',
  defaultTemperature: 0.2,
  defaultMaxTokens: 2048,
  defaultModel: 'deepseek-chat',
  timeoutMs: 30000
};
```

### Environment Variables

The service respects existing environment variables:
- `DEEPSEEK_API_KEY`: API key for DeepSeek models
- `KEYWORDS_LLM_MODEL`: Model for keyword generation
- `KEYWORDS_LLM_TEMPERATURE`: Temperature for keyword generation

### Runtime Configuration

```typescript
// Update configuration at runtime
llmService.updateConfig({
  defaultTemperature: 0.1,
  defaultModel: 'deepseek-coder'
});

// Get current configuration
const currentConfig = llmService.getConfig();
```

## Migration Guide

### Step 1: Import the Service

```typescript
// Old
import { createChatModel } from '@/lib/llm/core/modelFactory';

// New
import { llmService } from '@/lib/llm/service';
```

### Step 2: Replace Model Creation

```typescript
// Old
const chatModel = createChatModel(config);
const response = await chatModel.call(prompt);

// New
const response = await llmService.process({
  prompt,
  systemPrompt: config.systemPrompt,
  temperature: config.temperature
});
```

### Step 3: Update Error Handling

```typescript
// Old
try {
  const response = await chatModel.call(prompt);
} catch (error) {
  console.error('Model call failed:', error);
}

// New
try {
  const response = await llmService.process({ prompt });
} catch (error) {
  // Error handling is now centralized and consistent
  console.error('LLM processing failed:', error);
}
```

## Error Handling

The unified service provides consistent error handling:

```typescript
try {
  const response = await llmService.process({ prompt });
} catch (error) {
  if (error.message.includes('LLM processing failed')) {
    // Handle LLM-specific errors
  } else {
    // Handle other errors
  }
}
```

## Performance Considerations

1. **Singleton Pattern**: Single service instance reduces memory usage
2. **Connection Reuse**: Reuses LLM connections when possible
3. **Model Switching**: Efficiently switches between models as needed
4. **Timeout Management**: Centralized timeout handling

## Future Enhancements

1. **Caching**: Add response caching for repeated prompts
2. **Rate Limiting**: Centralized rate limiting across all LLM calls
3. **Metrics**: Track usage and performance metrics
4. **Fallback Models**: Automatic fallback to alternative models
5. **Batch Processing**: Process multiple requests efficiently

## Testing

```typescript
// Test the service
import { llmService } from '@/lib/llm/service';

describe('LLMService', () => {
  it('should process basic requests', async () => {
    const response = await llmService.process({
      prompt: 'Hello, world!'
    });
    
    expect(response.content).toBeDefined();
    expect(response.model).toBe('deepseek-chat');
  });
});
```

## Conclusion

The unified LLM architecture provides a clean, maintainable, and efficient way to handle all LLM interactions across the system. It eliminates duplication, ensures consistency, and makes the codebase easier to maintain and extend.
