# Senior DevOps interview talking points

1. GitHub Actions is CI/build/security scanning.
2. ECR stores immutable images.
3. Git is the GitOps source of truth.
4. Argo CD continuously reconciles Kubernetes state.
5. DEV auto-syncs; PROD is approval/manual.
6. EKS runs stateless services.
7. RDS is used instead of a PostgreSQL Deployment with emptyDir.
8. ElastiCache handles Redis.
9. Amazon MQ handles RabbitMQ.
10. ALB terminates TLS and routes traffic.
11. External Secrets pulls credentials from Secrets Manager.
12. HPA scales pods; PDB protects availability during disruption.
13. Readiness prevents traffic to unhealthy pods.
14. Liveness restarts stuck containers.
15. NetworkPolicy, IAM/IRSA, private nodes and encrypted AWS data services reduce blast radius.

