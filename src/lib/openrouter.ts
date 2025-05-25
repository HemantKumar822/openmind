
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

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    modelId: string,
    messages: OpenRouterMessage[],
    modelName: string
  ): Promise<string> {
    try {
      // Add system prompt as the first message
      const systemPrompt = getSystemPrompt(modelName);
      const messagesWithSystem: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(msg => msg.role !== 'system') // Remove any existing system messages
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LUMI - Learning & Understanding Machine Interface'
        },
        body: JSON.stringify({
          model: modelId,
          messages: messagesWithSystem,
          temperature: 0.7,
          max_tokens: 2048,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API Error:', errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from the model');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }
}
