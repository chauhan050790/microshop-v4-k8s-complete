# Kubernetes deployment runbook

## DEV
```bash
kubectl apply -k k8s/dev
kubectl get pods -n microshop-dev
kubectl get svc -n microshop-dev
kubectl get ingress -n microshop-dev
kubectl rollout status deployment/api-gateway -n microshop-dev
```

## Debugging
```bash
kubectl get pods -n microshop-dev -o wide
kubectl describe pod <pod> -n microshop-dev
kubectl logs <pod> -n microshop-dev --tail=200
kubectl get events -n microshop-dev --sort-by=.lastTimestamp
kubectl describe svc api-gateway -n microshop-dev
kubectl get endpoints api-gateway -n microshop-dev
```

## Production
Never use `kubectl set image` as the normal release mechanism.
Update GitOps desired state and allow Argo CD to reconcile.

Rollback:
```bash
argocd app history microshop-prod
argocd app rollback microshop-prod <ID>
```
or revert the Git commit that introduced the release.

