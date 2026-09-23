import { GCTX_P05_POSITIVE_CHAINS_A } from "./gctx-p05-positive-chains-a.js";
import { GCTX_P05_POSITIVE_CHAINS_B } from "./gctx-p05-positive-chains-b.js";

export const GCTX_P05_POSITIVE_CHAINS = Object.freeze([
  ...GCTX_P05_POSITIVE_CHAINS_A,
  ...GCTX_P05_POSITIVE_CHAINS_B,
]);

export const GCTX_P05_POSITIVE_CHAIN_BY_ID = new Map(
  GCTX_P05_POSITIVE_CHAINS.map((chain) => [chain.fixtureChainId, chain]),
);
