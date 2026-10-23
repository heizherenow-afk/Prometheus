import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

type ProviderEnv = Env & {
  AI_PROVIDER?: string;
  AI_MODEL?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
};

export function getAIModel(rawEnv: Env) {
  const env = rawEnv as ProviderEnv;
  const provider = (env.AI_PROVIDER || (env.GOOGLE_GENERATIVE_AI_API_KEY ? 'google' : env.OPENROUTER_API_KEY ? 'openrouter' : 'anthropic')).toLowerCase();
  const modelId = env.AI_MODEL;

  if (provider === 'google') {
    const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error('Google AI is selected, but GOOGLE_GENERATIVE_AI_API_KEY is not configured.');
    const google = createGoogleGenerativeAI({ apiKey });
    return google(modelId || 'gemini-1.5-flash');
  }

  if (provider === 'openrouter') {
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter is selected, but OPENROUTER_API_KEY is not configured.');
    const openrouter = createOpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      headers: { 'HTTP-Referer': 'https://prometheus.pages.dev', 'X-Title': 'Prometheus' },
    });
    return openrouter.chat(modelId || 'google/gemini-2.0-flash-001');
  }

  if (provider === 'anthropic') {
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic is selected, but ANTHROPIC_API_KEY is not configured.');
    const anthropic = createAnthropic({ apiKey });
    return anthropic(modelId || 'claude-3-5-sonnet-20240620');
  }

  throw new Error(`Unsupported AI_PROVIDER "${provider}". Use google, openrouter, or anthropic.`);
}
