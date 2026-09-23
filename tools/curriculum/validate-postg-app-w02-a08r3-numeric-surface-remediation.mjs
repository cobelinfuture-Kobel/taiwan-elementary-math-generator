#!/usr/bin/env node

import {
  buildW02A08R3NumericRemediationReadback
} from '../../src/curriculum/application/w02-a08r3-numeric-surface-remediation.mjs';

const result = buildW02A08R3NumericRemediationReadback();
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) process.exitCode = 1;
