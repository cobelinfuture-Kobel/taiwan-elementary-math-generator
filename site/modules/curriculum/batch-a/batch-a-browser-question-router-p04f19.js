export * from "./batch-a-browser-question-router-p04f18.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f18.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f19.js";
import {generateG5BU10AP04F19ConversionQuestions} from "./quantity-measurement-runtime-p04f19.js";
import {G5B_U10A_P04F19_SOURCE_ID,G5B_U10A_P04F19_SPEC_ID} from "../registry/g5b-u10a-metric-ton-kilogram-conversion-selector-projection-p04f19.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G5B_U10A_P04F19_SOURCE_ID||!plan.patternSpecIds?.includes(G5B_U10A_P04F19_SPEC_ID))return baseGenerate({...options,plan});return generateG5BU10AP04F19ConversionQuestions({...options,plan});}
