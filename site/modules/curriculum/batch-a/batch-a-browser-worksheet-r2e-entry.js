export * from "./batch-a-browser-worksheet-r2e-entry-p04f10.js";
import {buildBatchABrowserWorksheetDocument as buildP04F10R2EWorksheetDocument} from "./batch-a-browser-worksheet-r2e-entry-p04f10.js";
import {buildBatchABrowserWorksheetDocument as buildP04F11WorksheetDocument} from "./batch-a-browser-worksheet-p04f11-extension.js";
import {requestsP04F11} from "./batch-a-browser-generator-p04f11.js";
export function buildBatchABrowserWorksheetDocument(options={}){return requestsP04F11(options)?buildP04F11WorksheetDocument(options):buildP04F10R2EWorksheetDocument(options);}
