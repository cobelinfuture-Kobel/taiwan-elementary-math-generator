export * from "./batch-a-browser-question-router-p04f2.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f2.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f3.js";
import {generateG3BU03P04F3QuestionSet} from "./time-system-runtime-p04f3.js";
import {G3B_U03_P04F3_SPEC_ID,G3B_U03_P04F3_UNIT_CONVERSION_SPEC_ID} from "../registry/g3b-u03-time-12-24-conversion-selector-projection-p04f3.js";
const TARGET_SPECS=Object.freeze([G3B_U03_P04F3_SPEC_ID,G3B_U03_P04F3_UNIT_CONVERSION_SPEC_ID]);
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.some(id=>TARGET_SPECS.includes(id)))return baseGenerate({...options,plan});return generateG3BU03P04F3QuestionSet({...options,plan});}
