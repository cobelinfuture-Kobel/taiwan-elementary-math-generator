export * from "./batch-a-browser-worksheet-r2e-entry-p04f33.js";
import {buildBatchABrowserWorksheetDocument as baseBuild} from "./batch-a-browser-worksheet-r2e-entry-p04f33.js";
import {buildBatchABrowserWorksheetDocument as buildP04F34WorksheetDocument} from "./batch-a-browser-worksheet-p04f34-extension.js";
import {requestsP04F34} from "./batch-a-browser-generator-p04f34.js";
import {buildG5AU06CurrentMixedWorksheetDocument} from "./batch-a-browser-worksheet-g5a-u06-current-p04f34.js";
import {requestsG5AU06CurrentNumericApplicationMix} from "./g5a-u06-current-coordinator-p04f34.js";
import {applyG5AU06StructuredFractionDisplay} from "./g5a-u06-structured-fraction-worksheet.js";
export function buildBatchABrowserWorksheetDocument(options={}){const result=requestsG5AU06CurrentNumericApplicationMix(options)?buildG5AU06CurrentMixedWorksheetDocument(options):requestsP04F34(options)?buildP04F34WorksheetDocument(options):baseBuild(options);return applyG5AU06StructuredFractionDisplay(result);}
