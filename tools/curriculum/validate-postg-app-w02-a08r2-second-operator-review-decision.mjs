#!/usr/bin/env node

import { buildW02A08R2SecondOperatorReviewReadback } from '../../src/curriculum/application/w02-a08r2-second-operator-review-decision.mjs';

const verifyRegeneratedArtifacts = process.argv.includes('--verify-regenerated-artifacts');
const result = buildW02A08R2SecondOperatorReviewReadback({ verifyRegeneratedArtifacts });
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
