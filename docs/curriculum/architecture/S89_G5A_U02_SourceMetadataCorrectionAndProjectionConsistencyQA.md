# S89 G5A-U02 Source Metadata Correction and Projection Consistency QA

## Scope

This milestone corrects the canonical metadata for stable source ID `g5a_u02_5a02a1` and verifies that every S84 hidden projection evidence reference resolves to one of the two approved G5A-U02 source identities.

## Canonical correction

| Source ID | Canonical title | Canonical URL | Source role |
|---|---|---|---|
| `g5a_u02_5a02a` | 因數 | `https://meow911.com/5a02a/` | `factor_core` |
| `g5a_u02_5a02a1` | 公因數 | `https://meow911.com/5a03b/` | `common_factor_gcf_extension` |

The second packet keeps its stable source and packet IDs. S89 supersedes only the stale legacy title `因數` and missing URL. Historical S78 extraction artifacts remain immutable evidence of the earlier mismatch.

## Projection consistency

The audit checks:

- exactly two canonical source metadata rows;
- stable source IDs and packet IDs;
- exact corrected title, URL, and source role for `g5a_u02_5a02a1`;
- all 22 S84 hidden PatternSpecs remain present;
- every `s78:5a02a:*` and `s78:5a02a1:*` evidence reference resolves;
- every projection `sourcePacketIds` entry resolves to canonical source metadata;
- no unresolved evidence, source-ID re-key, routing, or lifecycle promotion.

## Lifecycle boundary

The metadata is canonical-corrected, but the unit remains hidden. Canonical routing is disabled and production use remains forbidden. S89 does not modify generators, validators, Class C/D bindings, public selectors, worksheets, renderers, or production routing.

## Acceptance

`npm test` must pass. The S89 test suite must prove the metadata correction and full projection evidence consistency before merge.
