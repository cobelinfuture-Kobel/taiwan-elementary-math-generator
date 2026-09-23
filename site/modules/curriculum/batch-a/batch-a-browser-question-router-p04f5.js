export * from "./batch-a-browser-question-router-p04f4.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f4.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f5.js";
import {generateG4AU10P04F5Questions} from "./quantity-measurement-runtime-p04f5.js";
import {G4A_U10_P04F5_SPEC_ID} from "../registry/g4a-u10-kilometer-unit-identity-selector-projection-p04f5.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.includes(G4A_U10_P04F5_SPEC_ID))return baseGenerate({...options,plan});return generateG4AU10P04F5Questions({...options,plan});}
