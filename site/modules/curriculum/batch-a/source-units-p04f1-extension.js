export * from "./source-units.js";
import * as base from "./source-units.js";
export const W4_SLICE001_PUBLIC_SOURCE_UNIT=Object.freeze({sourceId:"g3a_u04_3a04",grade:3,semester:"upper",unitCode:"3A-U04",title:"毫米與數線",domain:"quantity_measurement",lifecycle:"public_full_product_w4_slice001_candidate"});
export const P04F1_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS=Object.freeze([...base.CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,W4_SLICE001_PUBLIC_SOURCE_UNIT]);
export const CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS=P04F1_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS;
export function listBatchASourceUnits(options={}){const units=base.listBatchASourceUnits(options),browserDefault=typeof document!=="undefined",includeCurrent=options.includeW4Slice001??options.includeCurrentFullProductPublic??(browserDefault&&options.includeFullProductPublic===undefined&&options.includePublicCandidates===undefined);return includeCurrent&&!units.some(unit=>unit.sourceId===W4_SLICE001_PUBLIC_SOURCE_UNIT.sourceId)?[...units,{...W4_SLICE001_PUBLIC_SOURCE_UNIT}]:units;}
export function listCurrentFullProductPublicSourceUnits(){return P04F1_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map(unit=>({...unit}));}
export function getBatchASourceUnit(sourceId){return sourceId===W4_SLICE001_PUBLIC_SOURCE_UNIT.sourceId?{...W4_SLICE001_PUBLIC_SOURCE_UNIT}:base.getBatchASourceUnit(sourceId);}
export function isBatchASourceId(sourceId){return sourceId===W4_SLICE001_PUBLIC_SOURCE_UNIT.sourceId||base.isBatchASourceId(sourceId);}
