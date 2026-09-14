# Kubernetes platform bootstrap

Install these controllers before deploying MicroShop:

1. Argo CD
2. AWS Load Balancer Controller
3. External Secrets Operator
4. metrics-server
5. kube-prometheus-stack

The exact controller installation is account/cluster-specific. Use the official Helm charts and configure IRSA/Pod Identity.

Validate:
```bash
kubectl get nodes
kubectl get pods -A
kubectl get ingress -A
kubectl get externalsecret -A
```

Render:
```bash
kubectl kustomize k8s/dev
kubectl kustomize k8s/prod
```

Apply DEV:
```bash
kubectl apply -k k8s/dev
```

Apply PROD:
```bash
kubectl apply -k k8s/prod
```
In the GitOps model, Argo CD should apply these overlays instead of engineers running kubectl apply manually.

