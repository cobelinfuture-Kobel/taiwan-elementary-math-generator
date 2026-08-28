export * from "./batch-a-browser-worksheet-r2e-entry-p04f10.js";
import {buildBatchABrowserWorksheetDocument as buildP04F10R2EWorksheetDocument} from "./batch-a-browser-worksheet-r2e-entry-p04f10.js";
import {buildBatchABrowserWorksheetDocument as buildP04F11WorksheetDocument} from "./batch-a-browser-worksheet-p04f11-extension.js";
import {requestsP04F11} from "./batch-a-browser-generator-p04f11.js";
import {buildBatchABrowserWorksheetDocument as buildP04F12WorksheetDocument} from "./batch-a-browser-worksheet-p04f12-extension.js";
import {requestsP04F12} from "./batch-a-browser-generator-p04f12.js";
import {buildBatchABrowserWorksheetDocument as buildP04F13WorksheetDocument} from "./batch-a-browser-worksheet-p04f13-extension.js";
import {requestsP04F13} from "./batch-a-browser-generator-p04f13.js";
import {buildBatchABrowserWorksheetDocument as buildP04F14WorksheetDocument} from "./batch-a-browser-worksheet-p04f14-extension.js";
import {requestsP04F14} from "./batch-a-browser-generator-p04f14.js";
import {buildBatchABrowserWorksheetDocument as buildP04F15WorksheetDocument} from "./batch-a-browser-worksheet-p04f15-extension.js";
import {requestsP04F15} from "./batch-a-browser-generator-p04f15.js";
export function buildBatchABrowserWorksheetDocument(options={}){return requestsP04F15(options)?buildP04F15WorksheetDocument(options):requestsP04F14(options)?buildP04F14WorksheetDocument(options):requestsP04F13(options)?buildP04F13WorksheetDocument(options):requestsP04F12(options)?buildP04F12WorksheetDocument(options):requestsP04F11(options)?buildP04F11WorksheetDocument(options):buildP04F10R2EWorksheetDocument(options);}
