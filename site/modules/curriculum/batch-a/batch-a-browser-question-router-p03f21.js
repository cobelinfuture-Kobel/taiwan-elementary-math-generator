export * from "./batch-a-browser-question-router-p03f20.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p03f20.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p03f21.js";
import {canGenerateG5AU01Slice021Questions,generateG5AU01Slice021Questions} from "./decimal-read-place-runtime-p03f21.js";
export function generateBatchABrowserQuestions(o={}){const plan=buildBatchABrowserPlan(o);return canGenerateG5AU01Slice021Questions(plan)?generateG5AU01Slice021Questions({...o,plan}):baseGenerate(o);}
