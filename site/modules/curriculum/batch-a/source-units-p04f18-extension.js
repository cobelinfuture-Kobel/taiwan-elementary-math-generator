export * from "./source-units-p04f11-extension.js";
import * as base from "./source-units-p04f11-extension.js";
export const W4_SLICE018_PUBLIC_SOURCE_UNIT=Object.freeze({sourceId:"g5b_u09_5b09",grade:5,semester:"lower",unitCode:"5B-U09",title:"時間的乘除",domain:"time",lifecycle:"public_full_product_w4_slice018_candidate"});
export const P04F18_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS=Object.freeze([...base.P04F11_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,W4_SLICE018_PUBLIC_SOURCE_UNIT]);
export const CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS=P04F18_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS;
export function listBatchASourceUnits(options={}){const units=base.listBatchASourceUnits(options),browserDefault=typeof document!=="undefined",includeCurrent=options.includeW4Slice018??options.includeCurrentFullProductPublic??(browserDefault&&options.includeFullProductPublic===undefined&&options.includePublicCandidates===undefined);return includeCurrent&&!units.some(unit=>unit.sourceId===W4_SLICE018_PUBLIC_SOURCE_UNIT.sourceId)?[...units,{...W4_SLICE018_PUBLIC_SOURCE_UNIT}]:units;}
export function listCurrentFullProductPublicSourceUnits(){return P04F18_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map(unit=>({...unit}));}
export function getBatchASourceUnit(sourceId){return sourceId===W4_SLICE018_PUBLIC_SOURCE_UNIT.sourceId?{...W4_SLICE018_PUBLIC_SOURCE_UNIT}:base.getBatchASourceUnit(sourceId);}
export function isBatchASourceId(sourceId){return sourceId===W4_SLICE018_PUBLIC_SOURCE_UNIT.sourceId||base.isBatchASourceId(sourceId);}
