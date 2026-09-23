import {buildG6AU02P04F35InlineMathModel} from "./g6a-u02-inline-fraction-display-p04f35.js";
import {G6A_U02_P04F36_SOURCE_ID} from "../registry/g6a-u02-fraction-divided-by-fraction-selector-projection-p04f36.js";

export function buildG6AU02P04F36InlineMathModel({sourceId,plainText}={}){
  if(sourceId!==G6A_U02_P04F36_SOURCE_ID)return null;
  return buildG6AU02P04F35InlineMathModel({sourceId,plainText});
}
