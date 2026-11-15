import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCpuToMillis, parseMemoryToMiB, scanManifests } from '../core/src/scanner/manifests.js';
import { analyzeWorkloads, generatePatchYaml } from '../core/src/optimizer/calculator.js';
import { generateHtmlReport } from '../core/src/report/html.js';
import { LicenseVerifier } from '../ee/license/verifier.js';

console.log('🧪 Starting KubePrune Test Suite...\n');

// 1. CPU & Memory Parser Test
console.log('Test 1: CPU & Memory String Standardization');
assert.strictEqual(parseCpuToMillis('2'), 2000);
assert.strictEqual(parseCpuToMillis('500m'), 500);
assert.strictEqual(parseCpuToMillis('0.25'), 250);
console.log('  ✅ CPU parsing passed (cores & millis)');

assert.strictEqual(parseMemoryToMiB('4Gi'), 4096);
assert.strictEqual(parseMemoryToMiB('512Mi'), 512);
assert.strictEqual(parseMemoryToMiB('1G'), 1000);
console.log('  ✅ Memory parsing passed (Gi, Mi, G)');

// 2. Workload Scanning & Cluster Discovery Test
console.log('\nTest 2: Manifest Scanner & Cluster Discovery');
const workloads = scanManifests();
assert.ok(workloads.length >= 5);
assert.strictEqual(workloads[0].name, 'checkout-api');
assert.strictEqual(workloads[0].requests.cpuMillis, 2000);
assert.strictEqual(workloads[0].requests.memMiB, 4096);
console.log('  ✅ Discovered', workloads.length, 'sample workloads');

// 3. FinOps & Waste Calculator Test
console.log('\nTest 3: Kubernetes FinOps Waste & Savings Calculation');
const analysis = analyzeWorkloads(workloads);
assert.ok(analysis.summary.monthlyWasteUSD > 0, 'Monthly waste must be calculated');
assert.ok(analysis.summary.annualSavingsUSD > 0, 'Annual savings must be calculated');
assert.ok(analysis.summary.efficiencyPercentage < 100, 'Cluster efficiency must reflect over-provisioning');
assert.ok(analysis.recommendations.some(r => r.isOverprovisioned), 'At least one workload must be marked overprovisioned');
console.log('  ✅ Monthly Waste:', `$${analysis.summary.monthlyWasteUSD}`);
console.log('  ✅ Annual Savings:', `$${analysis.summary.annualSavingsUSD}`);
console.log('  ✅ Cluster Efficiency:', `${analysis.summary.efficiencyPercentage}%`);

// 4. Surgical Patch YAML Generation Test
console.log('\nTest 4: Surgical Right-Sizing Patch YAML Generation');
const patches = generatePatchYaml(analysis.recommendations);
assert.ok(patches.includes('apiVersion: apps/v1'));
assert.ok(patches.includes('checkout-api'));
assert.ok(patches.includes('resources:'));
console.log('  ✅ Surgical YAML patch generated successfully');

// 5. HTML Executive Report Generation Test
console.log('\nTest 5: Standalone HTML Executive Report Generation');
const html = generateHtmlReport(analysis);
assert.ok(html.includes('KubePrune Audit Report'));
assert.ok(html.includes(analysis.summary.monthlyWasteUSD.toFixed(2)));
assert.ok(html.includes('checkout-api'));
console.log('  ✅ Executive HTML report compiled cleanly');

// 6. Enterprise License Verifier Test
console.log('\nTest 6: Offline Cryptographic License Verifier (BSL 1.1)');
const verifier = new LicenseVerifier('test-secret');
const validKey = verifier.generateKey('AcmeCloud', 60, 'ENT');
const res = verifier.verifyKey(validKey);
assert.strictEqual(res.valid, true);
assert.strictEqual(res.organization, 'ACMECLOUD');
assert.strictEqual(res.tier, 'ENTERPRISE');
console.log('  ✅ Enterprise cryptographic key verification passed');

console.log('\n🎉 ALL KUBEPRUNE TESTS PASSED SUCCESSFULLY! 100% Operational.\n');
