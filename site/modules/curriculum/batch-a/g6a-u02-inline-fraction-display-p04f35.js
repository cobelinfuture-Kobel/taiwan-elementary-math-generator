import {validateInlineMathModel} from "../../renderer/inline-math.js";
import {G6A_U02_P04F35_SOURCE_ID} from "../registry/g6a-u02-integer-divided-by-fraction-selector-projection-p04f35.js";

const FRACTION_TOKEN=/(?:(\d+)\s+)?(\d+)\/(\d+)/g;
export function buildG6AU02P04F35InlineMathModel({sourceId,plainText}={}){
  if(sourceId!==G6A_U02_P04F35_SOURCE_ID)return null;
  const text=String(plainText??""),runs=[];let cursor=0,fractionCount=0;
  for(const match of text.matchAll(FRACTION_TOKEN)){
    const index=match.index??0;if(index>cursor)runs.push({kind:"text",value:text.slice(cursor,index)});
    const whole=match[1]===undefined?null:Number(match[1]),numerator=Number(match[2]),denominator=Number(match[3]);
    runs.push(whole===null?{kind:"fraction",numerator,denominator}:{kind:"mixed_fraction",whole,numerator,denominator});
    cursor=index+match[0].length;fractionCount+=1;
  }
  if(fractionCount===0)return null;if(cursor<text.length)runs.push({kind:"text",value:text.slice(cursor)});
  const model=Object.freeze({schemaName:"inline_math_v1",sourceId,plainText:text,runs:Object.freeze(runs.map(run=>Object.freeze(run)))}),validation=validateInlineMathModel(model,text);
  if(!validation.ok){const error=new Error("G6A-U02 P04F35 inline fraction binding is invalid.");error.code="p04f35_inline_fraction_binding_invalid";error.issues=validation.errors;throw error;}
  return model;
}
