export * from "./batch-a-browser-question-router-p04f10.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f10.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f11.js";
import {generateG4BU09P04F11Questions} from "./time-system-runtime-p04f11.js";
import {G4B_U09_P04F11_SOURCE_ID,G4B_U09_P04F11_SPEC_ID} from "../registry/g4b-u09-time-second-minute-hour-conversion-selector-projection-p04f11.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G4B_U09_P04F11_SOURCE_ID||!plan.patternSpecIds?.includes(G4B_U09_P04F11_SPEC_ID))return baseGenerate({...options,plan});return generateG4BU09P04F11Questions({...options,plan});}
