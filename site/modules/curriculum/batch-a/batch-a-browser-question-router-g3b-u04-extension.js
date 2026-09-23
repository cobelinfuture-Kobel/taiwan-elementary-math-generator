import { generateBatchABrowserQuestions as generateBaseBatchABrowserQuestions } from "./batch-a-browser-question-router.js";
import {
  canGenerateG3BU04HiddenSemanticQuestions,
  generateG3BU04HiddenSemanticQuestions
} from "./g3b-u04-semantic-question-generator.js";

export function generateBatchABrowserQuestions(options = {}) {
  if (canGenerateG3BU04HiddenSemanticQuestions(options)) {
    return generateG3BU04HiddenSemanticQuestions(options);
  }
  return generateBaseBatchABrowserQuestions(options);
}
