export * from "./batch-a-browser-question-router-p04f19.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f19.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f20.js";
import {generateG4AU10P04F20RouteDistanceQuestions} from "./quantity-measurement-runtime-p04f20.js";
import {G4A_U10_P04F20_SOURCE_ID,G4A_U10_P04F20_SPEC_ID} from "../registry/g4a-u10-route-distance-application-selector-projection-p04f20.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G4A_U10_P04F20_SOURCE_ID||!plan.patternSpecIds?.includes(G4A_U10_P04F20_SPEC_ID))return baseGenerate({...options,plan});return generateG4AU10P04F20RouteDistanceQuestions({...options,plan});}
