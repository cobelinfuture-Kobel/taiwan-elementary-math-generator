import {buildBatchABrowserWorksheetDocument as baseBuild} from "./batch-a-browser-worksheet-p04f29-extension.js";
import {requestsP04F30} from "./batch-a-browser-generator-p04f30.js";
import {buildG4AU09CurrentWorksheetDocumentP04F30} from "./g4a-u09-current-coordinator-p04f30.js";
export const P04F30_WORKSHEET_ADAPTER=Object.freeze({task:"P04F30_Q030_PatternSpecAndImplementation",status:"bounded_g4a_u09_decimal_length_connected",sourceId:"g4a_u09_4a09",knowledgePointId:"kp_g4a_u09_decimal_length_conversion",currentVisibleKnowledgePointCount:8,currentHiddenKnowledgePointCount:0,sharedDecimalSemantics:true,sharedPagination:true,sharedRenderer:true,parallelPipeline:false});
export function buildBatchABrowserWorksheetDocument(options={}){if(!requestsP04F30(options))return baseBuild(options);const result=buildG4AU09CurrentWorksheetDocumentP04F30(options);if(!result.ok)return result;return Object.freeze({...result,p04f30WorksheetAdapter:P04F30_WORKSHEET_ADAPTER});}
