export * from "./batch-a-browser-question-router-p04f3.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f3.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f4.js";
import {generateG3BU06P04F4QuestionSet} from "./quantity-measurement-runtime-p04f4.js";
import {G3B_U06_P04F4_INDIRECT_SPEC_ID,G3B_U06_P04F4_SCALE_SPEC_ID} from "../registry/g3b-u06-mass-selector-projection-p04f4.js";
const TARGET_SPECS=Object.freeze([G3B_U06_P04F4_INDIRECT_SPEC_ID,G3B_U06_P04F4_SCALE_SPEC_ID]);
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.some(id=>TARGET_SPECS.includes(id)))return baseGenerate({...options,plan});return generateG3BU06P04F4QuestionSet({...options,plan});}
