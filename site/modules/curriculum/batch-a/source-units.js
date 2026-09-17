export * from "./source-units-pre-p05f49.js";
import * as base from "./source-units-pre-p05f49.js";

export const W5_SLICE049_PUBLIC_SOURCE_UNITS=Object.freeze([
  Object.freeze({sourceId:"g6b_u03_6b03",grade:6,semester:"lower",unitCode:"6B-U03",title:"柱體體積與表面積",domain:"spatial_solid",lifecycle:"public_full_product_w5_slice049_candidate"})
]);
export const W6_SLICE001_PUBLIC_SOURCE_UNITS=Object.freeze([
  Object.freeze({sourceId:"g3a_u07_3a07",grade:3,semester:"upper",unitCode:"3A-U07",title:"尋找規律",domain:"pattern",lifecycle:"public_full_product_w6_slice001_candidate"})
]);
const q049=W5_SLICE049_PUBLIC_SOURCE_UNITS[0],qW6_001=W6_SLICE001_PUBLIC_SOURCE_UNITS[0];

export function listBatchASourceUnits(options={}){
  let units=base.listBatchASourceUnits(options);
  const browserDefault=typeof document!=="undefined";
  const defaultPublic=browserDefault&&options.includeFullProductPublic===undefined&&options.includePublicCandidates===undefined;
  const includeQ049=options.includeW5Slice049??options.includeCurrentFullProductPublic??defaultPublic;
  const includeW6Q001=options.includeW6Slice001??options.includeCurrentFullProductPublic??defaultPublic;
  if(includeQ049&&!units.some(unit=>unit.sourceId===q049.sourceId))units=[...units,{...q049}];
  if(includeW6Q001&&!units.some(unit=>unit.sourceId===qW6_001.sourceId))units=[...units,{...qW6_001}];
  return units;
}
export function getBatchASourceUnit(sourceId){if(sourceId===qW6_001.sourceId)return {...qW6_001};return sourceId===q049.sourceId?{...q049}:base.getBatchASourceUnit(sourceId);}
export function isBatchASourceId(sourceId){return sourceId===qW6_001.sourceId||sourceId===q049.sourceId||base.isBatchASourceId(sourceId);}
