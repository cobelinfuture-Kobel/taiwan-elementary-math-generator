export * from "./batch-a-browser-question-router-p03f22.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f22.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f23.js";
import { canGenerateG6AU02Slice023Questions, generateG6AU02Slice023Questions } from "./g6a-u02-reciprocal-runtime-p03f23.js";
export function generateBatchABrowserQuestions(options = {}) { const plan = buildBatchABrowserPlan(options); return canGenerateG6AU02Slice023Questions(plan) ? generateG6AU02Slice023Questions({ ...options, plan }) : baseGenerate(options); }
