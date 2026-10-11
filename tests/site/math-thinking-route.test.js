import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>readFileSync(path.join(root,p),'utf8');
test('Classic links an isolated MathThinking route; the school exam route is unchanged',()=>{
 const index=read('site/index.html');
 const page=read('site/math-thinking/index.html');
 assert.match(index,/href=".\/math-thinking\/">數學思維<\/a>/);
 assert.match(index,/href=".\/exam-template\/">考券模板<\/a>/);
 assert.match(page,/data-route-kind="math-thinking-pilot"/);
 assert.match(page,/sum-difference\.js|math-thinking\.js/);
 assert.match(page,/id="mt-output"/);
 assert.match(page,/id="mt-print"/);
});
test('MathThinking contract refuses automatic curriculum admission and source reproduction',()=>{
 const c=JSON.parse(read('data/math-thinking/math-thinking-m0-contract.json'));
 assert.equal(c.boundaries.noExistingKPMutation,true);
 assert.equal(c.boundaries.noAutomaticCurriculumAdmission,true);
 assert.equal(c.boundaries.publicSourceReproductionAllowed,false);
 assert.equal(c.curriculumBridge.admissionState,'NOT_ADMITTED');
 assert.equal(c.initialPilot.learningOrder,'PREREQUISITE_CONTROLLED_NOT_FIRST_BY_DEFAULT');
});
