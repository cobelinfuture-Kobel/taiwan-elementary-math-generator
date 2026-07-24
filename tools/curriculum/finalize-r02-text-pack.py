from pathlib import Path
import json

ROOT = Path('.')
CHUNK_PATHS = [
    f'data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-{i:02}.json'
    for i in range(1, 9)
]

records = []
for repo_path in CHUNK_PATHS:
    data = json.loads((ROOT / repo_path).read_text(encoding='utf-8'))
    records.extend(data.get('sourceRecords', []))
projections = sum(len(row.get('candidates', [])) for row in records)
unique_ids = {candidate['knowledgePointId'] for row in records for candidate in row.get('candidates', [])}
pages = sum(row.get('pageCount', 0) for row in records)
actual = (len(records), projections, len(unique_ids), pages)
expected = (50, 247, 242, 99)
if actual != expected:
    raise SystemExit(f'R02_TEXT_PACK_INTEGRITY_MISMATCH expected={expected} actual={actual}')

manifest_path = ROOT / 'data/curriculum/global/candidates/r02/reviewed-source-candidate-pack.manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
manifest.pop('compressedPackPath', None)
manifest['storageMode'] = 'JSON_CHUNKS'
manifest['chunkPaths'] = CHUNK_PATHS
manifest['counts'] = {
    'sourceNodeCount': 50,
    'candidateProjectionCount': 247,
    'uniqueKnowledgePointIdCount': 242,
    'semanticDuplicateProjectionCount': 5,
    'renderedPageCount': 99,
}
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

runtime_path = ROOT / 'src/curriculum/global/r02-global-kp-candidate-reconciliation.mjs'
runtime = runtime_path.read_text(encoding='utf-8').replace('import zlib from "node:zlib";\n', '')
old_runtime = '''function loadReviewedPack(root, manifestPath = REVIEWED_PACK_PATH) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), "utf8"));
  const compressed = fs.readFileSync(path.join(root, manifest.compressedPackPath));
  const decoded = JSON.parse(zlib.gunzipSync(compressed).toString("utf8"));
  return { ...manifest, sourceRecords: decoded.sourceRecords ?? [] };
}'''
new_runtime = '''function loadReviewedPack(root, manifestPath = REVIEWED_PACK_PATH) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), "utf8"));
  const chunkPaths = manifest.chunkPaths ?? manifest.shardPaths ?? [];
  const sourceRecords = chunkPaths.flatMap((repoPath) => {
    const chunk = JSON.parse(fs.readFileSync(path.join(root, repoPath), "utf8"));
    return chunk.sourceRecords ?? [];
  });
  return { ...manifest, sourceRecords };
}'''
if old_runtime not in runtime:
    raise SystemExit('R02_RUNTIME_LOADER_BLOCK_NOT_FOUND')
runtime_path.write_text(runtime.replace(old_runtime, new_runtime), encoding='utf-8')

validator_path = ROOT / 'tools/curriculum/validate-r02-global-kp-candidate-reconciliation.mjs'
validator = validator_path.read_text(encoding='utf-8').replace('import zlib from "node:zlib";\n', '')
old_validator = '''function loadReviewedPack(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, REVIEWED_PACK_PATH), "utf8"));
  const compressed = fs.readFileSync(path.join(root, manifest.compressedPackPath));
  const decoded = JSON.parse(zlib.gunzipSync(compressed).toString("utf8"));
  return { ...manifest, sourceRecords: decoded.sourceRecords ?? [] };
}'''
new_validator = '''function loadReviewedPack(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, REVIEWED_PACK_PATH), "utf8"));
  const chunkPaths = manifest.chunkPaths ?? manifest.shardPaths ?? [];
  const sourceRecords = chunkPaths.flatMap((repoPath) => {
    const chunk = JSON.parse(fs.readFileSync(path.join(root, repoPath), "utf8"));
    return chunk.sourceRecords ?? [];
  });
  return { ...manifest, sourceRecords };
}'''
if old_validator not in validator:
    raise SystemExit('R02_VALIDATOR_LOADER_BLOCK_NOT_FOUND')
validator_path.write_text(validator.replace(old_validator, new_validator), encoding='utf-8')

claim_path = ROOT / 'data/project/milestones/GCKG-R02.claim.json'
claim = json.loads(claim_path.read_text(encoding='utf-8'))
evidence = [
    value for value in claim['evidence']['beforeAfterEvidencePaths']
    if value != 'data/curriculum/global/candidates/r02/reviewed-source-candidate-pack.json.gz'
]
for repo_path in CHUNK_PATHS:
    if repo_path not in evidence:
        evidence.append(repo_path)
claim['evidence']['beforeAfterEvidencePaths'] = evidence
claim_path.write_text(json.dumps(claim, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

for obsolete in [
    'data/curriculum/global/candidates/r02/reviewed-source-candidate-pack.json.gz',
    'tools/curriculum/recover-r02-reviewed-pack.mjs',
    '.github/workflows/r02-recover-candidate-pack.yml',
    '.github/workflows/r02-finalize-text-pack.yml',
    '.github/workflows/r02-finalize-text-pack-v2.yml',
    'tools/curriculum/finalize-r02-text-pack.py',
]:
    target = ROOT / obsolete
    if target.exists():
        target.unlink()

print(f'R02_TEXT_PACK_PASS sources={actual[0]} projections={actual[1]} unique={actual[2]} pages={actual[3]}')
