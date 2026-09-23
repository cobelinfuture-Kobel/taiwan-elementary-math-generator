export * from "./batch-a-browser-question-router-p04f15.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f15.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f16.js";
import {generateG4AU10P04F16QuestionSet,P04F16_ALL_SPEC_IDS} from "./quantity-measurement-runtime-p04f16.js";
import {G4A_U10_P04F16_SOURCE_ID} from "../registry/g4a-u10-km-m-mixed-arithmetic-selector-projection-p04f16.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G4A_U10_P04F16_SOURCE_ID||!plan.patternSpecIds?.some(spec=>P04F16_ALL_SPEC_IDS.includes(spec)))return baseGenerate({...options,plan});return generateG4AU10P04F16QuestionSet({...options,plan});}
