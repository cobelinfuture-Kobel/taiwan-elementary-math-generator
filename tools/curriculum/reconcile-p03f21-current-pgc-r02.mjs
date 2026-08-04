import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {materializePgcR02UiCapabilityBinding} from "./materialize-pgc-r02-ui-capability-binding-r03.mjs";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const CONTRACT=path.join(ROOT,"data/curriculum/public-generation/ui_capability_binding_contract.json");
const priorPath=process.argv[2];
if(!priorPath||!fs.existsSync(priorPath))throw new Error("P03F21_PRIOR_PGC_R02_CONTRACT_REQUIRED");
const prior=JSON.parse(fs.readFileSync(priorPath,"utf8"));
const current=materializePgcR02UiCapabilityBinding();
const priorById=new Map(prior.bindings.map(row=>[row.bindingId,row]));
const bindings=current.bindings.map(row=>{
  const historical=priorById.get(row.bindingId);
  if(!historical)return row;
  const preserved=Object.fromEntries(Object.entries(historical).filter(([key])=>!Object.hasOwn(row,key)));
  return {...row,...preserved};
});
const terminalMetadata=Object.fromEntries(Object.entries(prior).filter(([key])=>
  (key.startsWith("lastR06")||key==="lastReconciliation"||key==="r06TerminalStatus")
  && !Object.hasOwn(current,key),
));
const reconciled={...current,...terminalMetadata,bindings};
fs.writeFileSync(CONTRACT,`${JSON.stringify(reconciled,null,2)}\n`);
console.log(`P03F21_PGC_R02_RECONCILED=${JSON.stringify({status:reconciled.status,publicSourceCount:reconciled.summary.publicSourceCount,visibleKnowledgePointCount:reconciled.summary.visibleKnowledgePointCount,bindingCount:bindings.length,preservedTerminalKeys:Object.keys(terminalMetadata)})}`);
