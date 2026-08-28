export * from "./batch-a-browser-question-router-p04f16.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f16.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f17.js";
import {generateG4BU09P04F17QuestionSet,P04F17_ALL_SPEC_IDS} from "./time-system-runtime-p04f17.js";
import {G4B_U09_P04F17_SOURCE_ID} from "../registry/g4b-u09-time-rank2-arithmetic-selector-projection-p04f17.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G4B_U09_P04F17_SOURCE_ID||!plan.patternSpecIds?.some(spec=>P04F17_ALL_SPEC_IDS.includes(spec)))return baseGenerate({...options,plan});return generateG4BU09P04F17QuestionSet({...options,plan});}
