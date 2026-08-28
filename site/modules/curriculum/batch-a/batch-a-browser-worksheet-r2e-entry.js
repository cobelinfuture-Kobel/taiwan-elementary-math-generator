export * from "./batch-a-browser-worksheet-r2e-entry-p04f9.js";
import {buildBatchABrowserWorksheetDocument as buildP04F9R2EWorksheetDocument} from "./batch-a-browser-worksheet-r2e-entry-p04f9.js";
import {buildBatchABrowserWorksheetDocument as buildP04F10WorksheetDocument} from "./batch-a-browser-worksheet-p04f10-extension.js";
import {requestsP04F10} from "./batch-a-browser-generator-p04f10.js";
export function buildBatchABrowserWorksheetDocument(options={}){return requestsP04F10(options)?buildP04F10WorksheetDocument(options):buildP04F9R2EWorksheetDocument(options);}
