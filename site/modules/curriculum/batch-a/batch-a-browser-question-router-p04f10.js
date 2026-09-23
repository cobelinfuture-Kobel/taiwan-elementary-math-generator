export * from "./batch-a-browser-question-router-p04f9.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f9.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f10.js";
import {generateG4AU10P04F10QuestionSet} from "./quantity-measurement-runtime-p04f10.js";
import {G4A_U10_P04F10_SPEC_ID} from "../registry/g4a-u10-km-m-conversion-selector-projection-p04f10.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.includes(G4A_U10_P04F10_SPEC_ID))return baseGenerate({...options,plan});return generateG4AU10P04F10QuestionSet({...options,plan});}
