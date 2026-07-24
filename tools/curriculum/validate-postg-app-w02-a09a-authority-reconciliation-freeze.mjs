#!/usr/bin/env node
import { buildW02A09AAuthorityFreezeReadback } from '../../src/curriculum/application/w02-a09a-authority-reconciliation-freeze.mjs';

const readback = buildW02A09AAuthorityFreezeReadback();
console.log(JSON.stringify(readback, null, 2));
if (!readback.ok) process.exitCode = 1;
