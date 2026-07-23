#!/usr/bin/env node

import { buildW02A08R4ApprovalReadback } from '../../src/curriculum/application/w02-a08r4-third-operator-approval.mjs';

const result = buildW02A08R4ApprovalReadback();
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) process.exitCode = 1;
