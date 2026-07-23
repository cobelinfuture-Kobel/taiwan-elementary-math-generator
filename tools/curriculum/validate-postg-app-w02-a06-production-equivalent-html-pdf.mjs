#!/usr/bin/env node

import { buildW02A06Readback } from '../../src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs';

const result = buildW02A06Readback();
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
