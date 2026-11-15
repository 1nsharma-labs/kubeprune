/**
 * KubePrune Kubernetes FinOps & Over-Provisioning Calculator
 * Standard Cloud Pricing Benchmarks (AWS / GCP average):
 * - 1 vCPU = ~$0.0316 / hour ($23.07 / month)
 * - 1 GiB RAM = ~$0.0042 / hour ($3.07 / month)
 */
export const COST_PER_VCPU_MONTH = 23.07;
export const COST_PER_GIB_MONTH = 3.07;
export const SAFETY_BUFFER_MULTIPLIER = 1.30; // 30% headroom buffer for spike resilience

/**
 * Calculate waste and recommendations for a list of workloads
 */
export function analyzeWorkloads(workloads = []) {
  let totalRequestedCpuMillis = 0;
  let totalRequestedMemMiB = 0;
  let totalUsedCpuMillis = 0;
  let totalUsedMemMiB = 0;

  const recommendations = [];

  for (const w of workloads) {
    const replicas = w.replicas || 1;
    const reqCpu = (w.requests?.cpuMillis || 500) * replicas;
    const reqMem = (w.requests?.memMiB || 512) * replicas;

    // Actual usage (from metrics-server or conservative default estimation 20%)
    const actualCpu = (w.actualUsage?.cpuMillis || Math.round(w.requests?.cpuMillis * 0.2)) * replicas;
    const actualMem = (w.actualUsage?.memMiB || Math.round(w.requests?.memMiB * 0.35)) * replicas;

    totalRequestedCpuMillis += reqCpu;
    totalRequestedMemMiB += reqMem;
    totalUsedCpuMillis += actualCpu;
    totalUsedMemMiB += actualMem;

    // Recommended request = actual + 30% safety buffer
    const recCpuPerPod = Math.max(50, Math.round((w.actualUsage?.cpuMillis || (w.requests?.cpuMillis * 0.2)) * SAFETY_BUFFER_MULTIPLIER));
    const recMemPerPod = Math.max(128, Math.round((w.actualUsage?.memMiB || (w.requests?.memMiB * 0.35)) * SAFETY_BUFFER_MULTIPLIER));

    // Wasted capacity per workload
    const wastedCpuMillis = Math.max(0, reqCpu - (recCpuPerPod * replicas));
    const wastedMemMiB = Math.max(0, reqMem - (recMemPerPod * replicas));

    // Monthly waste in USD
    const wastedCpuCost = (wastedCpuMillis / 1000) * COST_PER_VCPU_MONTH;
    const wastedMemCost = (wastedMemMiB / 1024) * COST_PER_GIB_MONTH;
    const totalWastedMonthlyUSD = wastedCpuCost + wastedMemCost;

    const isOverprovisioned = (w.requests?.cpuMillis > recCpuPerPod * 1.5) || (w.requests?.memMiB > recMemPerPod * 1.5);

    recommendations.push({
      name: w.name,
      namespace: w.namespace,
      kind: w.kind,
      replicas,
      current: {
        cpuMillis: w.requests?.cpuMillis || 500,
        memMiB: w.requests?.memMiB || 512,
        cpuStr: (w.requests?.cpuMillis || 500) + 'm',
        memStr: (w.requests?.memMiB || 512) + 'Mi'
      },
      actual: {
        cpuMillis: Math.round(actualCpu / replicas),
        memMiB: Math.round(actualMem / replicas)
      },
      recommended: {
        cpuMillis: recCpuPerPod,
        memMiB: recMemPerPod,
        cpuStr: recCpuPerPod + 'm',
        memStr: recMemPerPod + 'Mi',
        limitCpuStr: (recCpuPerPod * 2) + 'm',
        limitMemStr: (recMemPerPod * 2) + 'Mi'
      },
      wastedMonthlyUSD: Number(totalWastedMonthlyUSD.toFixed(2)),
      isOverprovisioned
    });
  }

  // Aggregate cluster metrics
  const totalWastedMonthlyUSD = recommendations.reduce((sum, r) => sum + r.wastedMonthlyUSD, 0);
  const projectedAnnualSavingsUSD = totalWastedMonthlyUSD * 12;

  const clusterCpuEfficiency = totalRequestedCpuMillis > 0 
    ? Math.round((totalUsedCpuMillis / totalRequestedCpuMillis) * 100) 
    : 100;
  const clusterMemEfficiency = totalRequestedMemMiB > 0 
    ? Math.round((totalUsedMemMiB / totalRequestedMemMiB) * 100) 
    : 100;

  const overallEfficiency = Math.round((clusterCpuEfficiency + clusterMemEfficiency) / 2);

  return {
    summary: {
      totalWorkloads: workloads.length,
      overprovisionedCount: recommendations.filter(r => r.isOverprovisioned).length,
      monthlyWasteUSD: Number(totalWastedMonthlyUSD.toFixed(2)),
      annualSavingsUSD: Number(projectedAnnualSavingsUSD.toFixed(2)),
      efficiencyPercentage: overallEfficiency,
      cpuEfficiencyPercentage: clusterCpuEfficiency,
      memEfficiencyPercentage: clusterMemEfficiency,
      totalRequestedVCPU: Number((totalRequestedCpuMillis / 1000).toFixed(1)),
      totalRequestedGiB: Number((totalRequestedMemMiB / 1024).toFixed(1))
    },
    recommendations
  };
}

/**
 * Generate surgical Kubernetes patch YAML for right-sizing
 */
export function generatePatchYaml(recommendations = []) {
  const patches = [];

  for (const r of recommendations) {
    if (!r.isOverprovisioned) continue;
    patches.push(`
# Right-size patch for ${r.kind}/${r.name} in namespace ${r.namespace}
# Estimated Monthly Savings: $${r.wastedMonthlyUSD}
apiVersion: apps/v1
kind: ${r.kind}
metadata:
  name: ${r.name}
  namespace: ${r.namespace}
spec:
  template:
    spec:
      containers:
        - name: ${r.name}
          resources:
            requests:
              cpu: "${r.recommended.cpuStr}"
              memory: "${r.recommended.memStr}"
            limits:
              cpu: "${r.recommended.limitCpuStr}"
              memory: "${r.recommended.limitMemStr}"
---`);
  }

  return patches.join('\n').trim();
}
