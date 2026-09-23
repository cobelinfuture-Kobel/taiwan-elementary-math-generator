export * from "./batch-a-browser-question-router-p04f5.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f5.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f6.js";
import {generateG3AU04P04F6QuestionSet} from "./quantity-measurement-runtime-p04f6.js";
import {G3A_U04_P04F6_SPEC_ID} from "../registry/g3a-u04-cm-mm-conversion-selector-projection-p04f6.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(!plan.patternSpecIds?.includes(G3A_U04_P04F6_SPEC_ID))return baseGenerate({...options,plan});return generateG3AU04P04F6QuestionSet({...options,plan});}
