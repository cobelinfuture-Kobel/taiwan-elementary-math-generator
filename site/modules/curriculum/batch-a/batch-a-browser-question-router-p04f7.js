export * from "./batch-a-browser-question-router-p04f6.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f6.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f7.js";
import {generateG3BU02P04F7QuestionSet} from "./quantity-measurement-runtime-p04f7.js";
import {G3B_U02_P04F7_SCALE_SPEC_ID,G3B_U02_P04F7_CONVERSION_SPEC_ID} from "../registry/g3b-u02-capacity-scale-conversion-selector-projection-p04f7.js";
const NEW_SPECS=Object.freeze([G3B_U02_P04F7_SCALE_SPEC_ID,G3B_U02_P04F7_CONVERSION_SPEC_ID]);
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.some(id=>NEW_SPECS.includes(id)))return baseGenerate({...options,plan});return generateG3BU02P04F7QuestionSet({...options,plan});}
