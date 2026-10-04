import {spawnSync} from "node:child_process";

const runners=[
  "tools/curriculum/run-g3a-u01-visual-rank01-flat-selector-acceptance.mjs",
  "tools/curriculum/run-g3a-u01-visual-rank01-mixed-selector-acceptance.mjs",
];

for(const runner of runners){
  const result=spawnSync(process.execPath,[runner],{stdio:"inherit",env:process.env});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}

console.log("G3AU01_RANK01_ALL_SELECTOR_ACCEPTANCE=PASS");
