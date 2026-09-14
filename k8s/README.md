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
- Secret example
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

Do not commit real Kubernetes Secrets.

