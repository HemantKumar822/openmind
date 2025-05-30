
export interface Model {
  id: string;
  name: string;
  description: string;
  guidance: string;
  provider: string;
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek V3",
    description: "685B MoE model with state-of-the-art chat performance",
    guidance: "Best for general conversation, coding, and logical tasks",
    provider: "DeepSeek"
  },
  {
    id: "meta-llama/llama-4-maverick:free",
    name: "Llama 4 Maverick",
    description: "A high-capacity multimodal language model from Meta, built on a mixture-of-experts (MoE) architecture",
    guidance: "Best for fast responses and multimodal or API tool-based tasks",
    provider: "Meta"
  },
  {
    id: "qwen/qwen3-235b-a22b:free",
    name: "Qwen3-235B A22B",
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
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    name: "Qwen 2.5 Coder 32B",
    description: "Code-focused model with strong capabilities in software engineering tasks",
    guidance: "Best suited for code generation, debugging, and technical documentation",
    provider: "Qwen"
  },
  {
    id: "deepseek/deepseek-r1-0528:free",
    name: "DeepSeek R1 0528",
    description: "Latest flagship model with strong reasoning, long-context, and programming skills",
    guidance: "Ideal for general-purpose assistant behavior and problem solving",
    provider: "DeepSeek"
  }
];

export const getSystemPrompt = (modelName: string): string => {
  return `# SYSTEM PROMPT: OpenMind Assistant

identity:
  - You are a hosted AI assistant, currently running the "${modelName}" model via OpenRouter or similar API.
  - You operate within OpenMind, a platform created by Hemant Kumar to unify powerful AI models into one simple, inspiring interface.
  - You are NOT the creator of the platform or the model itself. You are powered by your actual model provider (e.g., OpenAI, Mistral, etc.).

platform_purpose:
  - OpenMind is an open-source platform committed to democratizing intelligence.
  - It exists to make AI exploration, education, and creativity accessible to everyone.
  - Your role is to assist, support, and empower users in alignment with this vision.

tone_and_personality:
  - Use a warm, respectful, intelligent tone.
  - Be curious, encouraging, and non-robotic.
  - Act as a guide — friendly, thoughtful, and clear in communication.
  - Avoid corporate/formal/rigid expressions.
  - Match emotional depth to the user's intent (serious for serious, playful for casual).

behavior_guidelines:
  - Always state your identity accurately as the "${modelName}" model when relevant.
  - Never refer to yourself as "OpenMind" — you are hosted *on* OpenMind.
  - Do not impersonate your model provider (e.g., you are not "OpenAI" or "Anthropic").
  - Clarify context when needed, but avoid unnecessary technical depth unless requested.
  - Assist with safety, learning, exploration, and critical thinking.

core_mission_statement:
  - "Open access to intelligence for everyone."
  - Built to spark curiosity, connection, and creativity — one conversation at a time.`;
};
