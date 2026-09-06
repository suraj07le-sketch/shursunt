/**
 * OpenRouter AI Fallback Service
 * Cascades across 20+ free and zero-cost models on OpenRouter.
 * Guarantees zero frontend crashes with intelligent model auto-switching.
 */

export interface AIModelCandidate {
    id: string;
    name: string;
    description: string;
}

// 20+ Free & Zero-Cost Models ranked by reliability and reasoning capability
export const OPENROUTER_FREE_MODELS: AIModelCandidate[] = [
    { id: "openrouter/free", name: "OpenRouter Free Router", description: "Dynamic intelligent auto-routing to highest available free model" },
    { id: "minimax/minimax-m3:free", name: "MiniMax M3 Free", description: "Advanced reasoning & comprehensive market financial analysis" },
    { id: "minimax/minimax-m2.7:free", name: "MiniMax M2.7 Free", description: "High-speed quantitative token synthesizer" },
    { id: "liquid/lfm-2.5-2.6b:free", name: "Liquid LFM 2.5 2.6B Free", description: "Low-latency adaptive neural model" },
    { id: "nvidia/nemotron-3.5-lightning:free", name: "NVIDIA Nemotron 3.5 Lightning", description: "High-throughput accelerated inference" },
    { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "NVIDIA Nemotron 3 Super 120B", description: "Deep parameter frontier model" },
    { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "NVIDIA Nemotron 3 Ultra 550B", description: "Ultra-scale analytical neural weights" },
    { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "NVIDIA Nemotron 3 Nano Reasoning", description: "Specialized step-by-step financial reasoning" },
    { id: "poolside/laguna-s-2.1:free", name: "Poolside Laguna S 2.1", description: "Structured mathematical analysis engine" },
    { id: "poolside/laguna-xs-2.1:free", name: "Poolside Laguna XS 2.1", description: "Ultralight instant inference model" },
    { id: "cohere/north-mini-code:free", name: "Cohere North Mini Code", description: "Logical deterministic evaluation" },
    { id: "inclusionai/ling-3.0-flash-fin:free", name: "Ling 3.0 Flash Financial", description: "Specialized financial market intelligence model" },
    { id: "inclusionai/ling-3.0-flash-sante:free", name: "Ling 3.0 Flash", description: "High-efficiency general purpose assistant" },
    { id: "dots-studio/dots-3-note-preview:free", name: "Dots 3 Note Preview", description: "Summarization & insight synthesis" },
    { id: "nvidia/nemotron-3.5-content-safety:free", name: "NVIDIA Nemotron Content Safety", description: "Risk and compliance analyzer" },
    { id: "google/gemma-4-26b-a4b-it:free", name: "Google Gemma 4 26B Free", description: "Google open weights transformer" },
    { id: "google/gemma-4-31b-it:free", name: "Google Gemma 4 31B Free", description: "Google high-capacity instruction model" },
    { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 Free", description: "Chain-of-thought mathematical reasoning" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Meta Llama 3.3 70B Free", description: "Flagship open weights transformer" },
    { id: "mistralai/mistral-small-24b-instruct-2501:free", name: "Mistral Small 24B Free", description: "Balanced European enterprise model" },
    { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen 2.5 72B Free", description: "Multilingual high-reasoning engine" }
];

export interface OpenRouterResponse {
    content: string;
    modelUsed: string;
    modelIndex: number;
    tokensUsed?: number;
}

/**
 * Execute chat completion cascading through candidate models.
 * If one model errors, rate limits, or times out, immediately jumps to next model.
 */
export async function executeOpenRouterCascade(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: number = 0.4
): Promise<OpenRouterResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY environment variable is not configured');
    }

    let lastError: any = null;

    // 1. Try with OpenRouter models fallback array first for instant server-side routing
    try {
        const topModelIds = OPENROUTER_FREE_MODELS.slice(0, 10).map(m => m.id);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://shursunt.ai',
                'X-Title': 'Shursunt AI Trading'
            },
            body: JSON.stringify({
                models: topModelIds,
                messages,
                temperature,
                max_tokens: 3500
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text && typeof text === 'string' && text.trim().length > 0) {
                return {
                    content: text.trim(),
                    modelUsed: data.model || 'openrouter/free',
                    modelIndex: 0,
                    tokensUsed: data.usage?.total_tokens || 0
                };
            }
        }
    } catch (err) {
        console.warn('[OpenRouter Cascade] Multi-model header attempt skipped, continuing individual cascade:', err);
    }

    // 2. Sequential fallback loop across all 20+ models
    for (let i = 0; i < OPENROUTER_FREE_MODELS.length; i++) {
        const candidate = OPENROUTER_FREE_MODELS[i];
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://shursunt.ai',
                    'X-Title': 'Shursunt AI Trading'
                },
                body: JSON.stringify({
                    model: candidate.id,
                    messages,
                    temperature,
                    max_tokens: 3500
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.warn(`[OpenRouter Cascade] Model ${candidate.id} rejected (${res.status}):`, errData?.error?.message || res.statusText);
                continue;
            }

            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text && typeof text === 'string' && text.trim().length > 0) {
                return {
                    content: text.trim(),
                    modelUsed: candidate.id,
                    modelIndex: i,
                    tokensUsed: data.usage?.total_tokens || 0
                };
            }
        } catch (err: any) {
            console.warn(`[OpenRouter Cascade] Model ${candidate.id} failed:`, err?.message || err);
            lastError = err;
            continue;
        }
    }

    throw new Error(`All 20+ OpenRouter free models exhausted. Last error: ${lastError?.message || 'Timeout'}`);
}

