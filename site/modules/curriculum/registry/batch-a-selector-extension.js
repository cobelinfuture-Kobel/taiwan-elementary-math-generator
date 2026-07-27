export * from "./batch-a-selector-p01e-extension.js";

// This stable entry remains the P01E historical authority used by earlier inventory milestones.
// Current product consumers must opt in to later bounded successor extensions explicitly.
export {
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA as P01D2_BASE_SELECTOR_COMPOSER_METADATA,
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA as P01D3_BASE_SELECTOR_COMPOSER_METADATA,
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA as P01E_BASE_SELECTOR_COMPOSER_METADATA,
} from "./batch-a-selector-composer.js";
