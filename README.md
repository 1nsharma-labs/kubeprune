<h1 align="center">☸️ KubePrune</h1>

<p align="center">
  <b>The Open-Source Kubernetes Over-Provisioning & Pod Waste Killer</b><br>
  Slash your AWS EKS, GCP GKE, and AKS node bills by up to 60% with zero-downtime container right-sizing, automatic patch generation, and executive FinOps dashboards.
</p>

<p align="center">
  <a href="https://github.com/1nsharma-labs/kubeprune/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License"></a>
  <a href="https://github.com/1nsharma-labs/kubeprune/blob/main/ee/LICENSE-EE"><img src="https://img.shields.io/badge/EE_License-BSL_1.1-purple.svg" alt="EE License"></a>
  <a href="https://github.com/sponsors/1nsharma"><img src="https://img.shields.io/badge/Sponsor-GitHub_Sponsors-pink.svg" alt="Sponsor"></a>
  <a href="https://1nsharma-labs.github.io/kubeprune/"><img src="https://img.shields.io/badge/Live_Demo-Interactive_Report-0ea5e9.svg" alt="Live Demo"></a>
</p>

---

## ⚡ What is KubePrune?

Over **80% of Kubernetes clusters are massively over-provisioned**. Engineering teams set `cpu: 2000m` and `memory: 4Gi` for safety, while the container actually consumes `150m` and `400Mi`. You end up paying AWS, GCP, or Azure thousands of dollars every month for empty node capacity.

**KubePrune** scans your Kubernetes manifests or live cluster, measures over-provisioned vCPU and RAM, computes your exact dollar waste per month, and generates ready-to-apply right-sizing YAML patches with an automatic **30% safety headroom buffer** to eliminate OOMKilled crashes.

* 💰 **FinOps Scorecard:** Instantly view monthly cluster waste and annual recoverable savings in USD.
* 🛡️ **Zero-Downtime Right-Sizing:** Computes conservative requests and limits with 30% spike headroom.
* 🛠️ **Surgical YAML Patches:** Generates `kubeprune patch` manifests you can apply directly with `kubectl`.
* 📊 **Executive HTML Report:** Interactive visual dashboard for CFOs and engineering leaders.
* ⚡ **Zero External Dependencies:** Pure Node.js ESM. Runs in `< 50ms`.

---

## 🌐 Live Interactive Demo

View a sample executive Kubernetes FinOps audit report in your browser without cloning or installing:
👉 [**https://1nsharma-labs.github.io/kubeprune/**](https://1nsharma-labs.github.io/kubeprune/)

---

## 🚀 Quick Start (30 Seconds)

### Run via npx (Zero Installation)

```bash
# 1. Scan your manifests or cluster for waste
npx @1nsharma-labs/kubeprune scan ./k8s

# 2. Generate an executive HTML report
npx @1nsharma-labs/kubeprune report ./k8s --output cluster-audit.html

# 3. Generate surgical right-sizing YAML patch
npx @1nsharma-labs/kubeprune patch ./k8s --output right-size-patches.yaml
```

### Apply Recommendations

```bash
kubectl apply -f right-size-patches.yaml
```

---

## 💻 Sample Terminal Output

```text
  ==============================================================
    ☸️  KubePrune — Kubernetes Pod Waste & FinOps Killer v1.0.0
    🏢  Organization: 1nsharma-labs
  ==============================================================
  
  📈 CLUSTER EFFICIENCY SCORECARD:
  --------------------------------------------------------------
  💸 Monthly Cluster Waste:        $558.95 / month
  💰 Projected Annual Savings:     $6707.40 / year
  ⚙️  Cluster Overall Efficiency:   21% (CPU: 20%, RAM: 22%)
  ⚠️  Over-Provisioned Pods:       4 / 5 workloads
  --------------------------------------------------------------
  
  TOP WORKLOAD RECOMMENDATIONS:
  ---------------------------------------------------------------------------
  WORKLOAD                        CURRENT         RECOMMENDED     WASTE/MO
  ---------------------------------------------------------------------------
  checkout-api                    2000m/4096Mi    234m/624Mi      $204.60
  payments-worker                 1500m/3072Mi    182m/533Mi      $114.05
  notification-dispatcher         1000m/2048Mi    98m/273Mi       $52.26
  web-frontend                    800m/1024Mi     806m/1014Mi     $0.15
  analytics-aggregator            4000m/8192Mi    663m/2535Mi     $187.89
  ---------------------------------------------------------------------------
```

---

## 💼 Dual Licensing & Open-Core Model

* **Community Core (`/core`):** Licensed under **Apache License 2.0**. 100% free for individual developers and teams managing clusters under 100 pods.
* **Enterprise Edition (`/ee`):** Licensed under **Business Source License (BSL 1.1)**. Includes automated Mutating Admission Webhooks, continuous cluster sizing operators, and Slack/Teams alerts.

See [PRICING.md](PRICING.md) for pricing tiers.

---

## 🤝 Support & Enterprise

* **GitHub Sponsors:** [github.com/sponsors/1nsharma](https://github.com/sponsors/1nsharma)
* **Polar.sh:** [polar.sh/1nsharma-labs](https://polar.sh/1nsharma-labs)
* **Enterprise Inquiries:** `enterprise@1nsharma-labs.com`

---

## 🌐 The 1nsharma-labs Open-Source Suite

* 🛡️ [**TokenArmor**](https://github.com/1nsharma-labs/tokenarmor): AI Gateway & Token FinOps Firewall.
* 🍃 [**CloudPrune**](https://github.com/1nsharma-labs/cloudprune): AWS & GCP Cloud Waste & Zombie Resource Killer.
* 🔒 [**CompliGuard**](https://github.com/1nsharma-labs/compliguard): Continuous SOC 2 & ISO 27001 Evidence Engine.
* 🔑 [**SecretArmor**](https://github.com/1nsharma-labs/secretarmor): Zero-Trust Secret Sprawl & API Key Leak Firewall.
* ☸️ [**KubePrune**](https://github.com/1nsharma-labs/kubeprune): Kubernetes Over-Provisioning & Pod Waste Killer.
* 🏗️ [**DriftArmor**](https://github.com/1nsharma-labs/driftarmor): Terraform Drift Detector & Cloud Cost Firewall.
