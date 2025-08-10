import type { ChainDefinition, RunOptions } from './types';

const CHAINS = new Map<string, ChainDefinition<any, any>>();

export function registerChain(def: ChainDefinition) {
  CHAINS.set(def.id, def);
}

export function getChain(id: string): ChainDefinition | undefined {
  return CHAINS.get(id);
}

export async function runChain<TI = any, TO = any>(id: string, input: TI, options?: RunOptions): Promise<TO> {
  const def = CHAINS.get(id);
  if (!def) throw new Error(`Chain not found: ${id}`);
  return def.run(input, options);
}


