export * from "./batch-a-browser-question-router-p03f32.js";
import { generateBatchABrowserQuestions as baseGenerate } from "./batch-a-browser-question-router-p03f32.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f33.js";
import { canGenerateG4AU06P03F33Questions, generateG4AU06P03F33Questions } from "./g4a-u06-rank9-fraction-runtime-p03f33.js";
export function generateBatchABrowserQuestions(options={}){ const plan=buildBatchABrowserPlan(options); if(!canGenerateG4AU06P03F33Questions(plan)) return baseGenerate(options); return generateG4AU06P03F33Questions({...options,plan}); }
