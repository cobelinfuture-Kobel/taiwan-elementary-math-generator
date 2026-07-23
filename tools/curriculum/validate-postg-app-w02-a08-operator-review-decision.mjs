#!/usr/bin/env node

import { buildW02A08OperatorReviewReadback } from '../../src/curriculum/application/w02-a08-operator-review-decision.mjs';

const result = buildW02A08OperatorReviewReadback();
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
