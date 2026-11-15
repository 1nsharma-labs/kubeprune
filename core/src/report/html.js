/**
 * Generate a standalone executive visual HTML report for KubePrune audit
 */
export function generateHtmlReport(analysisResult) {
  const { summary, recommendations } = analysisResult;
  const now = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KubePrune Audit Report | Kubernetes FinOps</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #0b0f17; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .glass { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .pulse-dot { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  </style>
</head>
<body class="min-h-screen p-4 md:p-8">

  <!-- Header -->
  <header class="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4 glass rounded-2xl p-6">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-cyan-500/20">
        <i class="fa-solid fa-dharmachakra"></i>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight text-white">KubePrune Audit Report</h1>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30">Kubernetes FinOps</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">v1.0.0</span>
        </div>
        <p class="text-xs text-gray-400">1nsharma-labs &bull; Audited on ${now}</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <a href="https://github.com/1nsharma-labs/kubeprune" target="_blank" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition flex items-center gap-2">
        <i class="fa-brands fa-github text-sm"></i> GitHub Repository
      </a>
      <a href="https://github.com/sponsors/1nsharma" target="_blank" class="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-xs font-semibold text-white shadow-lg shadow-pink-600/30 transition flex items-center gap-2">
        <i class="fa-solid fa-heart text-xs"></i> Sponsor
      </a>
    </div>
  </header>

  <main class="max-w-6xl mx-auto space-y-6">

    <!-- Top KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="glass p-6 rounded-2xl">
        <div class="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Monthly Cluster Waste</div>
        <div class="text-3xl font-extrabold text-rose-500">$${summary.monthlyWasteUSD.toFixed(2)}</div>
        <p class="text-xs text-gray-400 mt-2">Over-allocated CPU & RAM drain</p>
      </div>

      <div class="glass p-6 rounded-2xl">
        <div class="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Annual Recoverable Savings</div>
        <div class="text-3xl font-extrabold text-emerald-400">$${summary.annualSavingsUSD.toFixed(2)}</div>
        <p class="text-xs text-gray-400 mt-2">Direct cloud bill reduction</p>
      </div>

      <div class="glass p-6 rounded-2xl">
        <div class="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Cluster Efficiency</div>
        <div class="text-3xl font-extrabold ${summary.efficiencyPercentage < 50 ? 'text-amber-400' : 'text-cyan-400'}">${summary.efficiencyPercentage}%</div>
        <p class="text-xs text-gray-400 mt-2">CPU: ${summary.cpuEfficiencyPercentage}% &bull; RAM: ${summary.memEfficiencyPercentage}%</p>
      </div>

      <div class="glass p-6 rounded-2xl">
        <div class="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Over-Provisioned Pods</div>
        <div class="text-3xl font-extrabold text-indigo-400">${summary.overprovisionedCount} / ${summary.totalWorkloads}</div>
        <p class="text-xs text-gray-400 mt-2">${((summary.overprovisionedCount / summary.totalWorkloads) * 100).toFixed(0)}% workloads oversized</p>
      </div>
    </div>

    <!-- Recommendations Table -->
    <div class="glass p-6 rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-list-check text-cyan-400"></i>
            Workload Right-Sizing Recommendations
          </h2>
          <p class="text-xs text-gray-400">Recommended requests include a 30% safety headroom buffer to eliminate throttling & OOMKilled risks.</p>
        </div>
        <button onclick="navigator.clipboard.writeText('kubeprune patch'); alert('Run kubeprune patch to apply!')" class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-md shadow-cyan-600/30">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Generate YAML Patches
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-800 text-gray-400 font-medium">
              <th class="py-3 px-3">Workload</th>
              <th class="py-3 px-3">Namespace</th>
              <th class="py-3 px-3">Replicas</th>
              <th class="py-3 px-3">Current Request</th>
              <th class="py-3 px-3">Actual Usage</th>
              <th class="py-3 px-3">Recommended Request</th>
              <th class="py-3 px-3 text-right">Monthly Waste</th>
              <th class="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800/60 font-mono">
            ${recommendations.map(r => `
              <tr class="hover:bg-gray-800/40 transition">
                <td class="py-3 px-3 font-semibold text-white font-sans flex items-center gap-2">
                  <span class="text-gray-400 text-[10px] px-1.5 py-0.5 rounded bg-gray-800">${r.kind}</span>
                  ${r.name}
                </td>
                <td class="py-3 px-3 text-gray-400 font-sans">${r.namespace}</td>
                <td class="py-3 px-3 text-gray-300">${r.replicas}</td>
                <td class="py-3 px-3 text-rose-400">${r.current.cpuStr} / ${r.current.memStr}</td>
                <td class="py-3 px-3 text-gray-400">${r.actual.cpuMillis}m / ${r.actual.memMiB}Mi</td>
                <td class="py-3 px-3 text-emerald-400 font-bold">${r.recommended.cpuStr} / ${r.recommended.memStr}</td>
                <td class="py-3 px-3 text-right font-bold ${r.wastedMonthlyUSD > 0 ? 'text-rose-400' : 'text-gray-400'}">
                  $${r.wastedMonthlyUSD.toFixed(2)}/mo
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold font-sans ${r.isOverprovisioned ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
                    ${r.isOverprovisioned ? 'OVERSIZED' : 'OPTIMAL'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Remediation Terminal -->
    <div class="glass p-6 rounded-2xl">
      <h3 class="text-base font-bold text-white mb-2">⚡ 1-Line Autonomous Remediation</h3>
      <p class="text-xs text-gray-400 mb-4">Run the KubePrune CLI directly in your terminal or CI/CD to generate surgical patches:</p>
      <div class="bg-black/60 border border-gray-800 rounded-xl p-4 font-mono text-xs text-cyan-400 flex items-center justify-between">
        <span>npx @1nsharma-labs/kubeprune patch --output recommendations.yaml</span>
        <button onclick="navigator.clipboard.writeText('npx @1nsharma-labs/kubeprune patch --output recommendations.yaml'); alert('Command copied!')" class="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px]">Copy</button>
      </div>
    </div>

  </main>
</body>
</html>`;
}
