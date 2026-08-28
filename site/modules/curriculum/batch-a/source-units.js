export * from "./source-units-pre-p04f11.js";
import * as base from "./source-units-pre-p04f11.js";
export const W4_SLICE011_PUBLIC_SOURCE_UNITS=Object.freeze([Object.freeze({sourceId:"g4b_u09_4b09",grade:4,semester:"lower",unitCode:"4B-U09",title:"時間的計算",domain:"time",lifecycle:"public_full_product_w4_slice011_candidate"})]);
const q011=W4_SLICE011_PUBLIC_SOURCE_UNITS[0];
export function listBatchASourceUnits(options={}){const units=base.listBatchASourceUnits(options),browserDefault=typeof document!=="undefined",includeCurrent=options.includeW4Slice011??options.includeCurrentFullProductPublic??(browserDefault&&options.includeFullProductPublic===undefined&&options.includePublicCandidates===undefined);return includeCurrent&&!units.some(unit=>unit.sourceId===q011.sourceId)?[...units,{...q011}]:units;}
export function getBatchASourceUnit(sourceId){return sourceId===q011.sourceId?{...q011}:base.getBatchASourceUnit(sourceId);}
export function isBatchASourceId(sourceId){return sourceId===q011.sourceId||base.isBatchASourceId(sourceId);}
