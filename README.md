# MicroShop — Complete Full-Stack DEV/PROD Repository

This repository is a complete runnable learning/portfolio platform for Senior DevOps interviews.

## Stack
React + TypeScript | Node.js + Express + TypeScript | PostgreSQL + Prisma | Redis | RabbitMQ
Docker | Kubernetes | Helm | AWS EKS/ECR/RDS/ElastiCache/Amazon MQ | Terraform
GitHub Actions | Argo CD | Prometheus/Grafana | AWS Secrets Manager + External Secrets

## Services
frontend : 3000
api-gateway : 4000
user-service : 4001
product-service : 4002
order-service : 4003
payment-service : 4004
notification-service : 4005

## Local quick start

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:3000

Register:
POST /api/auth/register
```json
{"email":"demo@example.com","password":"Password123!"}
```

Login:
POST /api/auth/login

Products:
GET /api/products

Create order:
POST /api/orders
Authorization: Bearer <token>
```json
{"items":[{"productId":"00000000-0000-0000-0000-000000000100","quantity":1}]}
```

## Full local architecture

Browser -> NGINX -> API Gateway -> services
Order/Payment -> RabbitMQ -> Notification
User/Product/Order/Payment -> PostgreSQL
Product -> Redis

## Production

Use separate AWS environments/accounts for DEV and PROD. Terraform creates the core AWS infrastructure.
Argo CD deploys the Helm release to EKS. DEV auto-syncs; PROD requires approval/manual sync.

Set the ECR registry and immutable Helm `releaseTag` at deployment time. Never commit real credentials.

## Commands

```bash
make install
make test
make compose-up
make compose-down
make helm-lint
```

For AWS:
```bash
cp infra/terraform/envs/dev/terraform.tfvars.example infra/terraform/envs/dev/terraform.tfvars
# update the password values and any region overrides in the copied file
cd infra/terraform/envs/dev
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars -auto-approve
aws eks update-kubeconfig --name microshop-dev --region ap-south-1
```

The repository already contains the Terraform for VPC, ECR, EKS, RDS, ElastiCache Redis, Amazon MQ, and the required Kubernetes platform manifests. Keep real secrets in the local `terraform.tfvars` files only; they are gitignored.

For a repeatable bootstrap flow on Windows or Linux, use:
```powershell
./infra/terraform/bootstrap-aws.ps1 -Environment dev
```

Then configure AWS Load Balancer Controller, External Secrets Operator, Argo CD and kube-prometheus-stack using docs/platform-bootstrap.md.

## Production caveat

The repository is production-oriented and intentionally explicit, but real production requires organization-specific security review, sizing, backup/restore validation, DR, WAF policy, observability SLOs, compliance controls, domain/certificate configuration and secret rotation.
