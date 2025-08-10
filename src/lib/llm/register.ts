import { registerChain } from './core/registry';
import { KeywordsChain } from './chains/keywords';

// Register all chains here (import this file once at startup)
registerChain(KeywordsChain);


