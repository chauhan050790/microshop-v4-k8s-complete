# Platform bootstrap

## Tools
- AWS CLI
- kubectl
- Helm
- Terraform
- Argo CD CLI

## Add-ons

Install AWS Load Balancer Controller with IRSA/Pod Identity.
Install External Secrets Operator.
Install kube-prometheus-stack.
Install Argo CD.

Do not use long-lived AWS access keys in GitHub. Configure GitHub Actions OIDC to an IAM role with least privilege.

## Secrets Manager

Create:
`microshop/dev`
`microshop/prod`

JSON keys:
JWT_SECRET
DATABASE_URL
REDIS_URL
RABBITMQ_URL

External Secrets creates `microshop-secrets`.

## DNS
Create Route53 records for:
dev.microshop.example.com
microshop.example.com

Set the matching ACM certificate ARNs in Helm values.

