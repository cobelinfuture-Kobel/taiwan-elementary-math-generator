import { materializeP03EW3DirectProductVerticalSliceQueue } from '../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs';
import { materializeP03CW3CapabilityCloseoutProductUnblockReconciliation } from '../../src/curriculum/full-product/p03c-w3-capability-closeout-product-unblock.mjs';
import { materializeR04SharedRuntimeCapabilityMatrix } from '../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs';

const kpId = 'kp_g3b_u09_tenths_fraction_decimal';
const queue = materializeP03EW3DirectProductVerticalSliceQueue();
const p03c = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();
const r04 = materializeR04SharedRuntimeCapabilityMatrix();
const slice = queue.queueEntries[8];
const downstream = p03c.downstreamUnblockRows.find((row) => row.knowledgePointId === kpId);
const kp = r04.knowledgePoints.find((row) => row.knowledgePointId === kpId);
const mapping = r04.getMapping(kpId);
const incoming = r04.prerequisiteGraph.edges.filter((edge) => edge.toKnowledgePointId === kpId);
const outgoing = r04.prerequisiteGraph.edges.filter((edge) => edge.fromKnowledgePointId === kpId);
console.log('P03F9_DISCOVERY=' + JSON.stringify({ slice, downstream, kp, mapping, incoming, outgoing }, null, 2));
