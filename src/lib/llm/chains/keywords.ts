import { z } from 'zod';
import { createChatModel } from '@/lib/llm/core/modelFactory';
import type { ChainDefinition, RunOptions } from '@/lib/llm/core/types';
import { extractJson, normalizeList } from '@/lib/llm/json';

export const KeywordsInputSchema = z.object({ industry: z.string().min(1) });

// Require search_terms only - simplified output
export const KeywordsOutputSchema = z
  .object({
    search_terms: z.array(z.string()).min(3),
    _debug: z.any().optional(),
  })
  .catchall(z.array(z.string()));

function buildPrompt(industry: string) {
  return `You are a keyword researcher for B2B/B2C lead gen. Return STRICT JSON ONLY (no prose, no comments, no code fences).

Goal: Produce clear, complete Google search terms that a person would type to find businesses that DO this industry (and relevant sub-industries). Do NOT include locations or placeholders. We will append location later.

Industry: "${industry}"

Rules:
- Language: lowercase, ascii, no emojis.
- No locations of any kind: remove city, state, country, "near me", neighborhoods, zip/postal codes, airports, landmarks, area names.
- No placeholders: {city}, {state}, {near_me} are forbidden.
- Terms should be 2–6 words (short, commercial intent).
- Include relevant sub-industries/services and business nouns (e.g., company, contractor, agency, firm, studio, clinic, shop, dealer, provider, supplier, wholesaler, manufacturer, installer, repair, service).
- Mix in transactional cues where natural (quote, price, cost, book, hire, buy, order).
- Exclude employment/DIY/education intents (jobs, careers, salary, how to, training, course, certificate, diy).

Return JSON with ONLY this key:
{
  "search_terms": []
}

Composition guidance for "search_terms":
- Combine subindustry/service + business noun + optional transactional signal.
- Good: "commercial hvac contractor", "emergency drain cleaning service", "dental implant clinic financing", "custom cabinet maker", "it support company 24/7", "solar panel installer warranty".
- Bad (reject): "plumber near me", "best landscaper in {city}", "hvac in toronto", "how to fix ac", "plumber jobs".

Quality thresholds:
- Provide at least 3 items in "search_terms" (aim for 50-100+ comprehensive keywords).
- No duplicates, no locations, each 2–6 words.
- Cover consumer and business use-cases where relevant.
- Be thorough and comprehensive - include all relevant variations and sub-industries.

Return ONLY the JSON object.`;
}

function isEmptyOutput(o: any): boolean {
  if (!o) return true;
  if (!Array.isArray(o.search_terms)) return true;
  return o.search_terms.length === 0;
}

const LOCATION_PATTERNS = [
  ' near me', ' nearby', ' in ', ' at ', ' around ', ' downtown ', ' uptown ',
  ' province', ' state', ' city', ' town', ' village', ' county', ' borough', ' neighborhood', ' zip', ' postal'
];

function stripLocations(term: string): string {
  let t = (term || '').toLowerCase().trim();
  if (!t) return t;
  t = t.replace(/\{[^}]+\}/g, ' ');
  for (const p of LOCATION_PATTERNS) t = t.replace(new RegExp(p, 'g'), ' ');
  t = t.replace(/\s+(in|at|near|around)\s+[a-z0-9\-.,’' ]+$/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

function isLikelyLocationy(term: string): boolean {
  return /\{.*\}/.test(term) || /( near me| nearby| in | at | around | city| state| province| zip| postal)/.test(term);
}

function passesLength(term: string): boolean {
  const w = term.split(/\s+/).filter(Boolean).length;
  return w >= 2 && w <= 6;
}

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function composeTerms(seed: Record<string, string[]>): string[] {
  const subs = seed.subindustries ?? seed.core_terms ?? [];
  const services = seed.service_queries ?? [];
  const bizNouns = [
    'company','contractor','agency','firm','studio','clinic','shop','dealer','provider','supplier',
    'wholesaler','distributor','manufacturer','installer','repair','service'
  ];
  const trans = seed.transactional_modifiers ?? ['quote','price','cost','hire','book','buy','order','same day','24/7','warranty','financing'];
  const pool: string[] = [];
  const base = uniq([...subs, ...services]).slice(0, 80);
  for (const b of base) {
    for (const n of bizNouns) {
      pool.push(`${b} ${n}`);
      for (const m of trans.slice(0, 6)) pool.push(`${b} ${n} ${m}`);
    }
  }
  return pool;
}

export const KeywordsChain: ChainDefinition<z.infer<typeof KeywordsInputSchema>, z.infer<typeof KeywordsOutputSchema>> = {
  id: 'keywords',
  description: 'Generate keyword lists for a given industry',
  inputSchema: KeywordsInputSchema,
  outputSchema: KeywordsOutputSchema,
  async run(input, options?: RunOptions) {
    const parsed = KeywordsInputSchema.parse(input);
    
    // Use DeepSeek model configuration
    const model = process.env.KEYWORDS_LLM_MODEL || 'deepseek-chat';
    const temperature = Number(process.env.KEYWORDS_LLM_TEMPERATURE ?? '0.3');
    const apiKey = process.env.DEEPSEEK_API_KEY;


    // DeepSeek is generally faster, so we can use a shorter timeout
    const timeoutMs = options?.timeoutMs ?? 60000;

    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured for DeepSeek model');
    }

    const chat = createChatModel({
      model,
      temperature,
      apiKey,
      timeoutMs,
    });
    
    const prompt = buildPrompt(parsed.industry);
    const debug = process.env.KEYWORDS_DEBUG === '1' || process.env.KEYWORDS_DEBUG === 'true';
    
    // Log configuration for debugging
    console.log('KeywordsChain config:', { model, temperature, hasApiKey: !!apiKey, debug, timeoutMs });
    
    const call = async (content: string) => {
      try {
        console.log('Calling DeepSeek model:', model, 'timeout:', timeoutMs);
        console.log('Prompt being sent:', content.substring(0, 200) + '...');
        
        const resp = await chat.invoke([
          { role: 'system', content: 'You must return strict JSON that validates against the described schema. No prose.' },
          { role: 'user', content },
        ]);
        
        const text = resp?.content?.toString?.() || (Array.isArray(resp?.content) ? resp.content.map((c: any) => c?.text || '').join('\n') : '');
        console.log('=== LLM RAW RESPONSE START ===');
        console.log('Full LLM response:', text);
        console.log('Response length:', text?.length || 0);
        console.log('Response type:', typeof text);
        console.log('=== LLM RAW RESPONSE END ===');
        
        const raw = extractJson(text);
        console.log('=== JSON EXTRACTION DEBUG ===');
        console.log('extractJson result:', raw);
        console.log('extractJson type:', typeof raw);
        console.log('extractJson keys:', raw ? Object.keys(raw) : 'no data');
        console.log('=== JSON EXTRACTION DEBUG END ===');
        
        const out: Record<string, string[]> = {};
        if (raw && typeof raw === 'object') {
          // Only process search_terms - that's all we need
          if (raw.search_terms && Array.isArray(raw.search_terms)) {
            out.search_terms = normalizeList(raw.search_terms, 256);
            console.log(`Processed search_terms:`, out.search_terms?.length || 0, 'items');
          } else {
            console.log('No search_terms found in LLM response');
            out.search_terms = [];
          }
          console.log('Processed output keys:', Object.keys(out), 'search_terms count:', out.search_terms?.length || 0);
        } else {
          console.log('No valid JSON extracted, raw was:', raw);
          out.search_terms = [];
        }
        
        // Clean search_terms
        console.log('=== SEARCH TERMS CLEANING DEBUG ===');
        console.log('Before cleaning - search_terms:', out.search_terms);
        console.log('Before cleaning - count:', out.search_terms?.length || 0);
        
        out.search_terms = uniq((out.search_terms ?? []).map(stripLocations).filter(Boolean).filter((t) => !isLikelyLocationy(t)).filter(passesLength));
        
        console.log('After cleaning - search_terms:', out.search_terms);
        console.log('After cleaning - count:', out.search_terms?.length || 0);
        console.log('=== SEARCH TERMS CLEANING DEBUG END ===');
        
        if (debug) (out as any)._debug = { rawText: text, parsedKeys: Object.keys(out) };
        return out;
      } catch (error) {
        console.error('DeepSeek model call failed:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          name: error instanceof Error ? error.name : 'Unknown error type'
        });
        throw error; // Re-throw to let the caller handle it
      }
    };

    // Make the LLM call
    console.log('Attempting DeepSeek LLM call...');
    let out;
    try {
      out = await call(prompt);
    } catch (error) {
      console.error('LLM call failed in KeywordsChain:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
      
      // Provide a fallback response if LLM fails
      console.log('Providing fallback response due to LLM failure');
      
      // Check if this is a DeepSeek configuration or balance issue
      const isDeepSeekConfigIssue = error instanceof Error && 
        (error.message.includes('DEEPSEEK_API_KEY not configured') || 
         error.message.includes('DeepSeek model error'));
      
      const isDeepSeekBalanceIssue = error instanceof Error && 
        error.message.includes('402 Insufficient Balance');
      
      out = {
        search_terms: [
          `${parsed.industry.toLowerCase()} company`,
          `${parsed.industry.toLowerCase()} services`,
          `${parsed.industry.toLowerCase()} contractor`,
          `${parsed.industry.toLowerCase()} provider`,
          `${parsed.industry.toLowerCase()} near me`,
          `${parsed.industry.toLowerCase()} quotes`,
          `${parsed.industry.toLowerCase()} estimates`,
        ],
        _debug: { 
          fallback: true, 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          isDeepSeekConfigIssue,
          isDeepSeekBalanceIssue,
          recommendation: isDeepSeekBalanceIssue ? 
            'DeepSeek account has insufficient balance - add credits or use fallback' : 
            isDeepSeekConfigIssue ? 
              'Check DeepSeek API key and configuration' : 
              'LLM service temporarily unavailable'
        }
      };
    }
    
    console.log('=== FINAL OUTPUT DEBUG ===');
    console.log('Final output - raw output:', out);
    console.log('Final output - search_terms count:', out.search_terms?.length || 0);
    console.log('Final output - search_terms:', out.search_terms);
    console.log('=== FINAL OUTPUT DEBUG END ===');
    
    return KeywordsOutputSchema.parse(out);
  },
};


