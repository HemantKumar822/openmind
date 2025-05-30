import { getSystemPrompt } from './models';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  error?: string;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly MAX_RETRIES = 3;
  private static readonly INITIAL_RETRY_DELAY = 1000; // 1 second
  private static readonly YIELD_INTERVAL = 16; // ~60fps
  private static readonly MAX_CHUNK_SIZE = 4 * 1024; // 4KB chunks

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async *processStream(reader: ReadableStreamDefaultReader<Uint8Array>, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let isDone = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    // Process a chunk of data from the stream
    const processChunk = (chunkData: string): { content: string; done: boolean } => {
      let content = '';
      let position = 0;
      let newlineIndex;
      let hasContent = false;

      // Process complete lines in the chunk
      while ((newlineIndex = chunkData.indexOf('\n', position)) >= 0) {
        const line = chunkData.slice(position, newlineIndex); // Don't trim to preserve whitespace
        position = newlineIndex + 1;

        if (line.startsWith('data: ')) {
          if (line === 'data: [DONE]') {
            isDone = true;
            buffer = ''; // Clear buffer on done
            return { content: '', done: true };
          }

          try {
            const data = JSON.parse(line.slice(6).trim());
            const chunkContent = data.choices?.[0]?.delta?.content || '';
            if (chunkContent) {
              content += chunkContent;
              hasContent = true;
            }
          } catch (e) {
            console.error('Error parsing chunk:', e, 'Line:', line);
          }
        }
      }
      
      // Save any remaining partial line to the buffer for the next chunk
      buffer = chunkData.slice(position);
      
      // Only return content if we actually have some to avoid empty updates
      return { 
        content: hasContent ? content : '', 
        done: isDone 
      };
    };

    try {
      while (true) {
        if (signal?.aborted) {
          throw new Error('Request was aborted');
        }

        let readResult: ReadableStreamReadResult<Uint8Array>;
        try {
          readResult = await reader.read();
        } catch (error) {
          console.error('Error reading from stream:', error);
          if (retryCount >= MAX_RETRIES) {
            console.error('Max retries reached, stopping stream');
            throw error;
          }
          
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
          retryCount++;
          continue;
        }
        
        const { done, value } = readResult;
        
        if (done) {
          // Process any remaining data in the buffer
          if (buffer) {
            const result = processChunk(buffer);
            if (result.content) {
              yield { content: result.content, done: false };
            }
          }
          break;
        }

        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Only process if we have complete lines or we're at the end
        let processedSomething = false;
        while (buffer.length > 0) {
          const result = processChunk(buffer);
          
          if (result.content) {
            // Immediately yield any content we have
            yield { content: result.content, done: false };
            processedSomething = true;
          }
          
          if (result.done) {
            isDone = true;
            break;
          }
          
          // If we didn't process anything new, break to wait for more data
          if (!processedSomething) {
            break;
          }
          
          // Small delay to prevent blocking the event loop
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      // Signal completion
      yield { content: '', done: true };
      
    } catch (error) {
      console.error('Error in processStream:', error);
      throw error;
    } finally {
      try {
        reader.releaseLock();
      } catch (e) {
        console.warn('Error releasing reader lock:', e);
      }
    }
  }

  private prepareMessages(
    messages: OpenRouterMessage[], 
    modelId: string, 
    systemPrompt: string
  ): OpenRouterMessage[] {
    const isGemma = modelId.toLowerCase().includes('gemma');
    const messagesToSend = [...messages];
    
    // Add system prompt if it's not a Gemma model
    if (systemPrompt && !isGemma) {
      messagesToSend.unshift({
        role: 'system',
        content: systemPrompt
      });
    }
    
    return messagesToSend;
  }

  private getModelContextWindow(modelId: string): number {
    // Return context window size in tokens based on the model
    const modelLower = modelId.toLowerCase();
    
    if (modelLower.includes('claude-3-opus')) return 200000;  // 200K tokens
    if (modelLower.includes('claude-3-sonnet')) return 200000; // 200K tokens
    if (modelLower.includes('claude-3-haiku')) return 200000;  // 200K tokens
    if (modelLower.includes('claude-2')) return 100000;        // 100K tokens
    if (modelLower.includes('gpt-4')) return 128000;           // 128K tokens
    if (modelLower.includes('gpt-3.5')) return 16385;          // 16K tokens
    if (modelLower.includes('llama-3-70b')) return 8192;       // 8K tokens
    
    return 4096; // Default context window size
  }

  async *streamMessage(
    modelId: string,
    messages: OpenRouterMessage[],
    modelName: string,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk> {
    const MAX_RETRIES = OpenRouterClient.MAX_RETRIES;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    // Use the full context window size for the model
    const maxContextTokens = this.getModelContextWindow(modelId);
    // Allocate 90% of context for response to leave room for conversation history
    const maxResponseTokens = Math.floor(maxContextTokens * 0.9);

    while (retryCount < MAX_RETRIES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // Increased timeout to 2 minutes
        
        if (signal) {
          signal.addEventListener('abort', () => controller.abort());
        }

        const systemPrompt = getSystemPrompt(modelName);
        const preparedMessages = this.prepareMessages(messages, modelId, systemPrompt);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'OpenMind Chat',
          },
          body: JSON.stringify({
            model: modelId,
            messages: preparedMessages,
            temperature: 0.7,
            max_tokens: maxResponseTokens,
            stream: true,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(
            `OpenRouter API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
          );
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Process the stream with our optimized processor
        for await (const chunk of this.processStream(response.body.getReader(), signal)) {
          yield chunk;
          
          // Allow other tasks to run between chunks
          if (chunk.content) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
        return; // Successfully completed

      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        
        if (signal?.aborted || (error as Error).name === 'AbortError') {
          throw new Error('Request was aborted by the user');
        }

        // Only retry on network errors or server errors
        if (!['NetworkError', 'TypeError'].includes((error as Error).name) && 
            !(error as Error).message.includes('50')) {
          break;
        }

        retryCount++;
        if (retryCount < MAX_RETRIES) {
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, OpenRouterClient.INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1))
          );
        }
      }
    }
    
    throw lastError || new Error('Failed to stream message after multiple attempts');
  }
}

export default OpenRouterClient;
