export * from "./source-units-pre-p05f49.js";
import * as base from "./source-units-pre-p05f49.js";

export const W5_SLICE049_PUBLIC_SOURCE_UNITS=Object.freeze([
  Object.freeze({sourceId:"g6b_u03_6b03",grade:6,semester:"lower",unitCode:"6B-U03",title:"柱體體積與表面積",domain:"spatial_solid",lifecycle:"public_full_product_w5_slice049_candidate"})
]);
export const W6_SLICE001_PUBLIC_SOURCE_UNITS=Object.freeze([
  Object.freeze({sourceId:"g3a_u07_3a07",grade:3,semester:"upper",unitCode:"3A-U07",title:"尋找規律",domain:"pattern",lifecycle:"public_full_product_w6_slice001_candidate"})
]);
export const W6_SLICE003_PUBLIC_SOURCE_UNITS=Object.freeze([
  Object.freeze({sourceId:"g3b_u10_3b10",grade:3,semester:"lower",unitCode:"3B-U10",title:"統計表",domain:"data",lifecycle:"public_full_product_w6_slice003_candidate"})
]);
export const W6_SLICE005_PUBLIC_SOURCE_UNITS=Object.freeze([
  Object.freeze({sourceId:"g4a_u07_4a07",grade:4,semester:"upper",unitCode:"4A-U07",title:"數量關係與規律",domain:"pattern",lifecycle:"public_full_product_w6_slice005_candidate"})
]);
export const W6_SLICE007_PUBLIC_SOURCE_UNITS=Object.freeze([
  Object.freeze({sourceId:"g4b_u05_4b05",grade:4,semester:"lower",unitCode:"4B-U05",title:"統計圖表",domain:"data",lifecycle:"public_full_product_w6_slice007_candidate"})
]);
export const W6_SLICE010_PUBLIC_SOURCE_UNITS=Object.freeze([
  Object.freeze({sourceId:"g5b_u11_5b11",grade:5,semester:"lower",unitCode:"5B-U11",title:"長條圖與折線圖",domain:"chart_data",lifecycle:"public_full_product_w6_slice010_candidate"})
]);
const q049=W5_SLICE049_PUBLIC_SOURCE_UNITS[0],qW6_001=W6_SLICE001_PUBLIC_SOURCE_UNITS[0],qW6_003=W6_SLICE003_PUBLIC_SOURCE_UNITS[0],qW6_005=W6_SLICE005_PUBLIC_SOURCE_UNITS[0],qW6_007=W6_SLICE007_PUBLIC_SOURCE_UNITS[0],qW6_010=W6_SLICE010_PUBLIC_SOURCE_UNITS[0];

export function listBatchASourceUnits(options={}){
  let units=base.listBatchASourceUnits(options);
  const browserDefault=typeof document!=="undefined";
  const defaultPublic=browserDefault&&options.includeFullProductPublic===undefined&&options.includePublicCandidates===undefined;
  const includeQ049=options.includeW5Slice049??options.includeCurrentFullProductPublic??defaultPublic;
  const includeW6Q001=options.includeW6Slice001??options.includeCurrentFullProductPublic??defaultPublic;
  const includeW6Q003=options.includeW6Slice003??options.includeCurrentFullProductPublic??defaultPublic;
  const includeW6Q005=options.includeW6Slice005??options.includeCurrentFullProductPublic??defaultPublic;
  const includeW6Q007=options.includeW6Slice007??options.includeCurrentFullProductPublic??defaultPublic;
  const includeW6Q010=options.includeW6Slice010??options.includeCurrentFullProductPublic??defaultPublic;
  if(includeQ049&&!units.some(unit=>unit.sourceId===q049.sourceId))units=[...units,{...q049}];
  if(includeW6Q001&&!units.some(unit=>unit.sourceId===qW6_001.sourceId))units=[...units,{...qW6_001}];
  if(includeW6Q003&&!units.some(unit=>unit.sourceId===qW6_003.sourceId))units=[...units,{...qW6_003}];
  if(includeW6Q005&&!units.some(unit=>unit.sourceId===qW6_005.sourceId))units=[...units,{...qW6_005}];
  if(includeW6Q007&&!units.some(unit=>unit.sourceId===qW6_007.sourceId))units=[...units,{...qW6_007}];
  if(includeW6Q010&&!units.some(unit=>unit.sourceId===qW6_010.sourceId))units=[...units,{...qW6_010}];
  return units;
}
export function getBatchASourceUnit(sourceId){if(sourceId===qW6_010.sourceId)return {...qW6_010};if(sourceId===qW6_007.sourceId)return {...qW6_007};if(sourceId===qW6_005.sourceId)return {...qW6_005};if(sourceId===qW6_003.sourceId)return {...qW6_003};if(sourceId===qW6_001.sourceId)return {...qW6_001};return sourceId===q049.sourceId?{...q049}:base.getBatchASourceUnit(sourceId);}
export function isBatchASourceId(sourceId){return sourceId===qW6_010.sourceId||sourceId===qW6_007.sourceId||sourceId===qW6_005.sourceId||sourceId===qW6_003.sourceId||sourceId===qW6_001.sourceId||sourceId===q049.sourceId||base.isBatchASourceId(sourceId);}
