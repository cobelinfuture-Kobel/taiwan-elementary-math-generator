#!/usr/bin/env node

import { buildW02A08R1Readback } from '../../src/curriculum/application/w02-a08r1-student-facing-remediation.mjs';

const result = buildW02A08R1Readback();
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
