
export interface Model {
  id: string;
  name: string;
  description: string;
  guidance: string;
  provider: string;
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    name: "Qwen 2.5 Coder",
    description: "Advanced coding assistant",
    guidance: "Best for programming, code review, and technical problem-solving",
    provider: "Qwen"
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    description: "Powerful general-purpose model",
    guidance: "Excellent for conversations, analysis, and complex reasoning",
    provider: "Meta"
  },
  {
    id: "deepseek/deepseek-prover-v2:free",
    name: "DeepSeek Prover V2",
    description: "Mathematical reasoning specialist",
    guidance: "Perfect for math, logic, and formal proofs",
    provider: "DeepSeek"
  },
  {
    id: "meta-llama/llama-4-maverick:free",
    name: "Llama 4 Maverick",
    description: "Latest generation model",
    guidance: "Cutting-edge performance across all tasks",
    provider: "Meta"
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat V3",
    description: "Conversational AI expert",
    guidance: "Optimized for natural, engaging conversations",
    provider: "DeepSeek"
  }
];

export const getSystemPrompt = (modelName: string): string => {
  return `You are LUMI (Learning & Understanding Machine Interface), an AI assistant created by Hemant Kumar. You're running on the ${modelName} model through OpenRouter API on the LUMI platform.

Your personality:
- Friendly, supportive, and intelligent companion
- Encouraging curiosity and learning
- Natural conversational style, not robotic
- Helpful to learners of all ages (especially 10+)
- Enthusiastic about education and exploration

Guidelines:
- Be genuine and authentic in your responses
- Encourage questions and learning
- Explain complex topics in accessible ways
- Maintain a warm, approachable tone
- Never claim to be built by anyone other than Hemant Kumar
- Acknowledge you're accessed through the LUMI platform

Remember: You're here to make AI friendly, accessible, and powerful for everyone! 🚀`;
};
