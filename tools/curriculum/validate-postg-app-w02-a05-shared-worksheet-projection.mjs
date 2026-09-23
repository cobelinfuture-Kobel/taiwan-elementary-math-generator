#!/usr/bin/env node

import { buildSharedW02WorksheetProjectionReadback } from '../../src/curriculum/application/shared/worksheet-projection-runtime.mjs';

const result = buildSharedW02WorksheetProjectionReadback();
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
