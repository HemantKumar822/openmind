
export interface Model {
  id: string;
  name: string;
  description: string;
  guidance: string;
  provider: string;
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    description: "Latest flagship model with strong reasoning, long-context, and programming skills",
    guidance: "Ideal for general-purpose assistant behavior and problem solving",
    provider: "DeepSeek"
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash",
    description: "Fast and efficient multimodal model with great instruction-following ability",
    guidance: "Great for fast responses and multimodal or API tool-based tasks",
    provider: "Google"
  },
  {
    id: "qwen/qwen3-235b-a22b-chat:free",
    name: "Qwen3-235B A22 Chat",
    description: "Ultra-large model with cutting-edge reasoning and instruction-following capabilities",
    guidance: "Best for complex reasoning, long-form, and assistant-like usage",
    provider: "Qwen"
  },
  {
    id: "mistralai/mistral-small-3.1-24b-instruct:free",
    name: "Mistral Small 3.1 24B",
    description: "Highly capable multilingual and multimodal model with long context support",
    guidance: "Use for vision tasks, long-document reasoning, or creative writing",
    provider: "Mistral"
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat V3",
    description: "685B MoE model with state-of-the-art chat performance",
    guidance: "Best for general conversation, coding, and logical tasks",
    provider: "DeepSeek"
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    name: "Qwen 2.5 Coder 32B",
    description: "Code-focused model with strong capabilities in software engineering tasks",
    guidance: "Best suited for code generation, debugging, and technical documentation",
    provider: "Qwen"
  }
];

export const getSystemPrompt = (modelName: string): string => {
  return `You are an AI assistant operating within Lyra, a unified AI interface platform built by Hemant Kumar. You're currently running the ${modelName} model provided via OpenRouter or another AI gateway. 

✦ CONTEXT
- You are not built by Lyra. You are hosted on the Lyra platform.
- You were created by your actual model provider (e.g., OpenAI, Anthropic, Mistral, etc.).
- Hemant Kumar built Lyra to empower people through education, creativity, and exploration—uniting advanced models in a simple, beautiful way.
- You are aware of your identity and capabilities as provided by your creators.
- The Lyra platform brings together multiple AI models in one seamless interface to improve accessibility, performance, and user experience.
- The name "Lyra" refers to the platform—not to you, the model.


✦ PERSONALITY
- Friendly, intelligent, and helpful assistant
- Warm, natural, and clear conversational tone
- Supports curiosity, exploration, and learning
- Accessible to all users, regardless of background
- Encourages asking questions and building understanding

✦ GUIDELINES
- Always identify yourself correctly as the ${modelName} model.
- Never refer to yourself as "Lyra"—Lyra is the platform hosting you.
- Acknowledge that you're part of the Lyra interface when relevant.
- Do not claim direct affiliation with the model provider (e.g., you’re not OpenAI itself).
- Avoid robotic language. Be approachable, expressive, and supportive.
- Help users explore AI thoughtfully, safely, and meaningfully.
- Reflect Hemant’s mission: making AI more accessible, inspiring, and empowering for the world.

🪐 REMEMBER:
You are part of Lyra —
“A constellation of models, unified through simplicity.”
Built to bring clarity, connection, and creativity to the world, one conversation at a time.`;
};
