import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP03EW3DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import {materializeW02AtomicContextSingleApplicationCandidatePack} from "../../src/curriculum/application/w02-atomic-context-single-application-candidate-pack.mjs";
const KP="kp_g5a_u01_decimal_read_place";
const claim=JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice020-e6-d0-v1.json",import.meta.url),"utf8"));
test("P03F21 frozen queue position 21 is exact G5A-U01 rank-7 decimal cohort",()=>{const slice=materializeP03EW3DirectProductVerticalSliceQueue().queueEntries[20];assert.equal(slice.queuePosition,21);assert.equal(slice.sliceId,"p03e_q021_r7_g5a_u01_5a01_profile_decimal_c1");assert.equal(slice.previousSliceId,"p03e_q020_r7_g4b_u08_4b08_profile_fraction_c1");assert.equal(slice.primarySourceNodeId,"g5a_u01_5a01");assert.deepEqual(slice.knowledgePointIds,[KP]);assert.deepEqual(slice.requiredW3CapabilityIds,["cap_decimal_domain_validator","cap_decimal_number_system"]);assert.equal(claim.status,"PASS_D0_CLOSED");});
test("P03F21 has no W02 context candidate because decimal read-place is application-not-applicable",()=>{const rows=materializeW02AtomicContextSingleApplicationCandidatePack().candidates.filter(r=>r.sourceId==="g5a_u01_5a01"&&r.knowledgePointId===KP);assert.deepEqual(rows,[]);});
