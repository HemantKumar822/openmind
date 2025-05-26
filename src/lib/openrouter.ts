
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

/**
 * Client for interacting with the OpenRouter API.
 * Handles sending messages and streaming responses.
 */
export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  /**
   * Creates an instance of OpenRouterClient.
   * @param {string} apiKey - The API key for authenticating with OpenRouter.
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Streams messages from the OpenRouter API.
   *
   * @param {string} modelId - The ID of the model to use for the chat.
   * @param {OpenRouterMessage[]} messages - An array of messages in the conversation.
   * @param {string} modelName - The name of the model (used for system prompt).
   * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request.
   * @param {number} [temperature] - Optional temperature for sampling (default: 0.7).
   * @param {number} [max_tokens] - Optional maximum tokens to generate (default: 2048).
   * @returns {AsyncGenerator<StreamChunk>} An async generator yielding chunks of the stream.
   * Each chunk contains content, a done flag, and an optional error message.
   */
  async *streamMessage(
    modelId: string,
    messages: OpenRouterMessage[],
    modelName: string,
    signal?: AbortSignal,
    temperature?: number,
    max_tokens?: number
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
          temperature: temperature ?? 0.7,
          max_tokens: max_tokens ?? 2048,
          stream: true
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData}`);
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
              // Log parsing errors if necessary, or handle them silently
              // console.error('Error parsing JSON:', error); 
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
        // This yield will execute whether an error occurred or not, signaling the end.
        yield { content: '', done: true };
      }

    } catch (error) {
      if (error instanceof Error) {
        yield { content: '', done: true, error: error.message };
      } else {
        yield { content: '', done: true, error: 'An unknown error occurred' };
      }
      // Ensure stream still ends if an error is caught and yielded.
      // This might be redundant if the finally block's yield is always hit.
      // However, if an error occurs before the try-finally involving the reader,
      // this ensures doneness. For robustness, consider if error yielding should also be here.
      // For now, the finally block should cover the main path.
    }
  }

  /**
   * Sends messages to the OpenRouter API and returns the complete response.
   * This is a non-streaming version that collects all streamed chunks.
   * Kept for backward compatibility or scenarios where streaming is not needed.
   *
   * @param {string} modelId - The ID of the model to use for the chat.
   * @param {OpenRouterMessage[]} messages - An array of messages in the conversation.
   * @param {string} modelName - The name of the model (used for system prompt).
   * @param {number} [temperature] - Optional temperature for sampling (default: 0.7).
   * @param {number} [max_tokens] - Optional maximum tokens to generate (default: 2048).
   * @returns {Promise<string>} A promise that resolves with the full response content from the assistant.
   * @throws {Error} If an error occurs during streaming or if the stream itself reports an error.
   */
  async sendMessage(
    modelId: string,
    messages: OpenRouterMessage[],
    modelName: string,
    temperature?: number,
    max_tokens?: number
  ): Promise<string> {
    let fullResponse = '';
    
    for await (const chunk of this.streamMessage(modelId, messages, modelName, undefined, temperature, max_tokens)) {
      if (chunk.error) {
        throw new Error(chunk.error);
      }
      fullResponse += chunk.content;
    }
    
    return fullResponse;
  }
}
