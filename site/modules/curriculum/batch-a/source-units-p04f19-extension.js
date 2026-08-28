export * from "./source-units-p04f18-extension.js";
import * as base from "./source-units-p04f18-extension.js";
export const W4_SLICE019_PUBLIC_SOURCE_UNIT=Object.freeze({sourceId:"g5b_u10_5b10a",grade:5,semester:"lower",unitCode:"5B-U10a",title:"生活中的大單位",domain:"quantity_measurement",lifecycle:"public_full_product_w4_slice019_candidate"});
export const P04F19_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS=Object.freeze([...base.P04F18_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,W4_SLICE019_PUBLIC_SOURCE_UNIT]);
export const CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS=P04F19_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS;
export function listBatchASourceUnits(options={}){const units=base.listBatchASourceUnits(options),browserDefault=typeof document!=="undefined",includeCurrent=options.includeW4Slice019??options.includeCurrentFullProductPublic??(browserDefault&&options.includeFullProductPublic===undefined&&options.includePublicCandidates===undefined);return includeCurrent&&!units.some(unit=>unit.sourceId===W4_SLICE019_PUBLIC_SOURCE_UNIT.sourceId)?[...units,{...W4_SLICE019_PUBLIC_SOURCE_UNIT}]:units;}
export function listCurrentFullProductPublicSourceUnits(){return P04F19_CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map(unit=>({...unit}));}
export function getBatchASourceUnit(sourceId){return sourceId===W4_SLICE019_PUBLIC_SOURCE_UNIT.sourceId?{...W4_SLICE019_PUBLIC_SOURCE_UNIT}:base.getBatchASourceUnit(sourceId);}
export function isBatchASourceId(sourceId){return sourceId===W4_SLICE019_PUBLIC_SOURCE_UNIT.sourceId||base.isBatchASourceId(sourceId);}
