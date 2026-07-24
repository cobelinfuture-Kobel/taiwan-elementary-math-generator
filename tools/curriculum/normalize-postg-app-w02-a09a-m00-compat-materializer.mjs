#!/usr/bin/env node
import fs from 'node:fs';

const file = 'tools/curriculum/materialize-postg-app-w02-a09a-m00-compat-repair.mjs';
const before = `source = replaceBetween(source, 'export function buildPOSTGAPPMasterReadback', '', readbackBlock);`;
const after = `{
  const readbackStart = source.indexOf('export function buildPOSTGAPPMasterReadback');
  if (readbackStart < 0) throw new Error('Missing buildPOSTGAPPMasterReadback marker');
  source = \`${'${source.slice(0, readbackStart)}'}${'${readbackBlock}'}\`;
}`;
const current = fs.readFileSync(file, 'utf8');
if (current.includes(after)) {
  console.log(JSON.stringify({ changed: false, file }, null, 2));
} else {
  if (!current.includes(before)) throw new Error('Unexpected compat materializer source');
  fs.writeFileSync(file, current.replace(before, after));
  console.log(JSON.stringify({ changed: true, file }, null, 2));
}
