export * from "./source-units-p04f3-extension.js";
import * as base from "./source-units-p04f3-extension.js";
export const W4_SLICE004_PUBLIC_SOURCE_UNIT=Object.freeze({sourceId:"g3b_u06_3b06",grade:3,semester:"lower",unitCode:"3B-U06",title:"公斤與公克",domain:"quantity_measurement",lifecycle:"public_full_product_w4_slice004_candidate"});
export const P04F4_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS=Object.freeze([...base.P04F3_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,W4_SLICE004_PUBLIC_SOURCE_UNIT]);
export const CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS=P04F4_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS;
export function listBatchASourceUnits(options={}){const units=base.listBatchASourceUnits(options),browserDefault=typeof document!=="undefined",includeCurrent=options.includeW4Slice004??options.includeCurrentFullProductPublic??(browserDefault&&options.includeFullProductPublic===undefined&&options.includePublicCandidates===undefined);return includeCurrent&&!units.some(unit=>unit.sourceId===W4_SLICE004_PUBLIC_SOURCE_UNIT.sourceId)?[...units,{...W4_SLICE004_PUBLIC_SOURCE_UNIT}]:units;}
export function listCurrentFullProductPublicSourceUnits(){return P04F4_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map(unit=>({...unit}));}
export function getBatchASourceUnit(sourceId){return sourceId===W4_SLICE004_PUBLIC_SOURCE_UNIT.sourceId?{...W4_SLICE004_PUBLIC_SOURCE_UNIT}:base.getBatchASourceUnit(sourceId);}
export function isBatchASourceId(sourceId){return sourceId===W4_SLICE004_PUBLIC_SOURCE_UNIT.sourceId||base.isBatchASourceId(sourceId);}
