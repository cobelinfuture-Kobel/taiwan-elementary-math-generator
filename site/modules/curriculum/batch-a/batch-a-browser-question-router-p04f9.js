export * from "./batch-a-browser-question-router-p04f8.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f8.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f9.js";
import {generateG3BU06P04F9QuestionSet} from "./quantity-measurement-runtime-p04f9.js";
import {G3B_U06_P04F9_SPEC_ID} from "../registry/g3b-u06-mass-kg-g-conversion-selector-projection-p04f9.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.includes(G3B_U06_P04F9_SPEC_ID))return baseGenerate({...options,plan});return generateG3BU06P04F9QuestionSet({...options,plan});}
