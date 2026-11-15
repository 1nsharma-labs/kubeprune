#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { scanManifests } from './scanner/manifests.js';
import { analyzeWorkloads, generatePatchYaml } from './optimizer/calculator.js';
import { generateHtmlReport } from './report/html.js';

const args = process.argv.slice(2);
const command = args[0] || 'scan';

async function main() {
  if (args.includes('--help') || args.includes('-h') || command === 'help') {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('kubeprune v1.0.0 (1nsharma-labs)');
    process.exit(0);
  }

  const targetPath = args[1] && !args[1].startsWith('--') ? args[1] : null;

  console.log(`
  ==============================================================
    ☸️  KubePrune — Kubernetes Pod Waste & FinOps Killer v1.0.0
    🏢  Organization: 1nsharma-labs
  ==============================================================
  `);

  console.log(`🔍 Scanning Kubernetes workloads... [Target: ${targetPath || 'Cluster Manifests'}]`);
  const workloads = scanManifests(targetPath);
  console.log(`📦 Discovered ${workloads.length} workloads across namespaces.\n`);

  const analysis = analyzeWorkloads(workloads);
  const { summary, recommendations } = analysis;

  if (command === 'scan') {
    printScanSummary(summary, recommendations);
    process.exit(0);
  }

  if (command === 'report') {
    const outIndex = args.indexOf('--output');
    const outPath = outIndex !== -1 ? args[outIndex + 1] : 'kubeprune-report.html';
    const html = generateHtmlReport(analysis);
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`📊 Executive FinOps report generated: ${path.resolve(outPath)}`);
    printScanSummary(summary, recommendations);
    process.exit(0);
  }

  if (command === 'patch') {
    const outIndex = args.indexOf('--output');
    const outPath = outIndex !== -1 ? args[outIndex + 1] : 'kubeprune-recommendations.yaml';
    const patchYaml = generatePatchYaml(recommendations);
    fs.writeFileSync(outPath, patchYaml, 'utf-8');
    console.log(`🛠️ Surgical right-sizing YAML patch saved: ${path.resolve(outPath)}`);
    console.log(`💡 Apply with: kubectl apply -f ${outPath}`);
    process.exit(0);
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

function printScanSummary(summary, recommendations) {
  console.log(`
  📈 CLUSTER EFFICIENCY SCORECARD:
  --------------------------------------------------------------
  💸 Monthly Cluster Waste:        $${summary.monthlyWasteUSD.toFixed(2)} / month
  💰 Projected Annual Savings:     $${summary.annualSavingsUSD.toFixed(2)} / year
  ⚙️  Cluster Overall Efficiency:   ${summary.efficiencyPercentage}% (CPU: ${summary.cpuEfficiencyPercentage}%, RAM: ${summary.memEfficiencyPercentage}%)
  ⚠️  Over-Provisioned Pods:       ${summary.overprovisionedCount} / ${summary.totalWorkloads} workloads
  --------------------------------------------------------------
  `);

  console.log('  TOP WORKLOAD RECOMMENDATIONS:');
  console.log('  ' + '-'.repeat(75));
  console.log('  WORKLOAD                        CURRENT         RECOMMENDED     WASTE/MO');
  console.log('  ' + '-'.repeat(75));

  for (const r of recommendations) {
    const name = (r.name.length > 30 ? r.name.slice(0, 27) + '...' : r.name).padEnd(30);
    const curr = `${r.current.cpuStr}/${r.current.memStr}`.padEnd(15);
    const rec = `${r.recommended.cpuStr}/${r.recommended.memStr}`.padEnd(15);
    const waste = `$${r.wastedMonthlyUSD.toFixed(2)}`;
    console.log(`  ${name}  ${curr} ${rec} ${waste}`);
  }
  console.log('  ' + '-'.repeat(75));
  console.log('\n  Run `kubeprune report` to generate executive HTML dashboard.');
  console.log('  Run `kubeprune patch` to generate ready-to-apply right-sizing YAML.\n');
}

function printHelp() {
  console.log(`
KubePrune — The Open-Source Kubernetes Over-Provisioning & Pod Waste Killer

USAGE:
  kubeprune [command] [path] [flags]

COMMANDS:
  scan [path]                 Scan Kubernetes manifests or cluster for waste (default)
  report [path] [--output f]  Generate interactive executive HTML report
  patch [path] [--output f]   Generate ready-to-apply surgical right-sizing YAML
  help                        Show help information

FLAGS:
  --output, -o                Specify output file path for report or patch
  --version, -v               Show version
  --help, -h                  Show help
  `);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
