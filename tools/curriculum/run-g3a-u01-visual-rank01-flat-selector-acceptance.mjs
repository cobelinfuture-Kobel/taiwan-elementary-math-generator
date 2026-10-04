import {spawnSync} from "node:child_process";

const runners=[
  "tools/curriculum/run-g3a-u01-visual-rank01-classic-ui-acceptance.mjs",
  "tools/curriculum/run-g3a-u01-visual-rank01-exam-template-acceptance.mjs",
  "tools/curriculum/run-g3a-u01-visual-rank01-three-mode-mixed-acceptance.mjs",
];

for(const runner of runners){
  const result=spawnSync(process.execPath,[runner],{stdio:"inherit",env:process.env});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}

console.log("G3AU01_RANK01_FLAT_SELECTOR_AND_MIXED_ACCEPTANCE=PASS");
