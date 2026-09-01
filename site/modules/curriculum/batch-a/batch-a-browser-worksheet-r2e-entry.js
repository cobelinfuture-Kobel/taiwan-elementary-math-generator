export * from "./batch-a-browser-worksheet-r2e-entry-p04f33.js";
import {buildBatchABrowserWorksheetDocument as baseBuild} from "./batch-a-browser-worksheet-r2e-entry-p04f33.js";
import {buildBatchABrowserWorksheetDocument as buildP04F34WorksheetDocument} from "./batch-a-browser-worksheet-p04f34-extension.js";
import {requestsP04F34} from "./batch-a-browser-generator-p04f34.js";
export function buildBatchABrowserWorksheetDocument(options={}){return requestsP04F34(options)?buildP04F34WorksheetDocument(options):baseBuild(options);}
