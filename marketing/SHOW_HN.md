# Hacker News Launch: Show HN: KubePrune – Find over-provisioned Kubernetes pods and slash cloud bills

**Title:** Show HN: KubePrune – Find over-provisioned Kubernetes pods and slash cloud bills

**URL / Text:**
Hey HN! Amit here from 1nsharma-labs.

Like many teams running Kubernetes on AWS EKS or GCP GKE, we noticed that almost every deployment was wildly over-provisioned. Developers set `cpu: 2000m` and `memory: 4Gi` "just in case", while the actual container idle-sits at 120m and 400Mi. 

Commercial FinOps platforms like Cast AI or Kubecost charge thousands per month and want you to install complex daemonsets or telemetry forwarders into your production clusters.

We built **KubePrune** – an open-source, zero-dependency CLI that scans your Kubernetes manifests or cluster, calculates your exact dollar waste per month, and generates ready-to-apply right-sizing YAML patches with an automatic 30% safety headroom buffer so pods never OOMKill.

Repo: https://github.com/1nsharma-labs/kubeprune
Live Interactive Report Demo: https://1nsharma-labs.github.io/kubeprune/

Features:
- Pure Node.js ESM (runs in < 50ms, zero npm runtime dependencies)
- Standardized AWS/GCP vCPU & GiB RAM hourly cost benchmarks
- Computes monthly waste ($/mo) and annual recoverable savings ($/yr)
- Generates surgical YAML patches (`kubeprune patch`)
- Standalone executive visual HTML dashboard (`kubeprune report`)

Quick test (no install needed):
`npx @1nsharma-labs/kubeprune scan`

Would love to hear how much waste KubePrune finds in your clusters and what features you'd like to see next!
