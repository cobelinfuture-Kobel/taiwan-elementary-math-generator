export * from "./batch-a-browser-question-router-p04f7.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f7.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f8.js";
import {generateG3BU03P04F8QuestionSet} from "./time-arithmetic-runtime-p04f8.js";
import {G3B_U03_P04F8_ELAPSED_SPEC_ID,G3B_U03_P04F8_ARITHMETIC_SPEC_ID} from "../registry/g3b-u03-elapsed-time-regrouping-selector-projection-p04f8.js";
const NEW_SPECS=Object.freeze([G3B_U03_P04F8_ELAPSED_SPEC_ID,G3B_U03_P04F8_ARITHMETIC_SPEC_ID]);
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.some(id=>NEW_SPECS.includes(id)))return baseGenerate({...options,plan});return generateG3BU03P04F8QuestionSet({...options,plan});}
