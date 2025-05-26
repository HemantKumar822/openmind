
import { getSystemPrompt } from './models';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  error?: string;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async *streamMessage(
    modelId: string,
    messages: OpenRouterMessage[],
    modelName: string,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk> {
    try {
      // Add system prompt as the first message
      const systemPrompt = getSystemPrompt(modelName);
      const messagesWithSystem: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(msg => msg.role !== 'system')
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Lyra - A constellation of models, unified through simplicity'
        },
        body: JSON.stringify({
          model: modelId,
          messages: messagesWithSystem,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API Error:', errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            if (trimmedLine === 'data: [DONE]') {
              yield { content: '', done: true };
              return;
            }

            if (!trimmedLine.startsWith('data: ')) continue;

            try {
              const jsonStr = trimmedLine.slice(6).trim();
              if (!jsonStr) continue;
              
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                yield { content, done: false };
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      yield { content: '', done: true };
    } catch (error) {
      console.error('Error in streamMessage:', error);
      if (error instanceof Error) {
        yield { content: '', done: true, error: error.message };
      } else {
        yield { content: '', done: true, error: 'An unknown error occurred' };
      }
    }
  }

  // Keep the original non-streaming method for backward compatibility
  async sendMessage(
    modelId: string,
    messages: OpenRouterMessage[],
    modelName: string
  ): Promise<string> {
    let fullResponse = '';
    
    for await (const chunk of this.streamMessage(modelId, messages, modelName)) {
      if (chunk.error) {
        throw new Error(chunk.error);
      }
      fullResponse += chunk.content;
    }
    
    return fullResponse;
  }
}
