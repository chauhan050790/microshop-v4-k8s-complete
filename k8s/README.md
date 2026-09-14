# Kubernetes

There are now TWO deployment approaches:

## 1. Kustomize — standalone Kubernetes manifests

DEV:
`kubectl apply -k k8s/dev`

PROD:
`kubectl apply -k k8s/prod`

Base manifests:
- Namespace
- ServiceAccount
- ConfigMap
- ExternalSecret-backed runtime credentials
- 7 Deployments
- 7 Services
- HPA
- PDB
- NetworkPolicies
- ALB Ingress
- ExternalSecret

## 2. Helm — GitOps/Argo CD

Argo CD uses:
`helm/microshop/values-dev.yaml`
and
`helm/microshop/values-prod.yaml`

Recommended production workflow:
Git -> Argo CD -> Helm -> EKS.

The Kustomize overlays use an immutable bootstrap SHA and registry so they
remain parseable. Before applying them, set the real ECR registry and 40
character image tag with `kustomize edit set image` (or use the Helm/Argo
workflow, which enforces `releaseTag`).

Do not commit real Kubernetes Secrets.
