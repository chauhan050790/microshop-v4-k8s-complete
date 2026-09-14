terraform {required_version=">=1.6.0" required_providers {aws={source="hashicorp/aws",version="~>5.0"}}}
provider "aws" {region=var.region}
module "vpc" {source="../../modules/vpc";name="microshop-dev";cidr="10.20.0.0/16"}
module "ecr" {source="../../modules/ecr";repositories=["frontend","api-gateway","user-service","product-service","order-service","payment-service","notification-service"]}
module "eks" {source="../../modules/eks";name="microshop-dev";vpc_id=module.vpc.vpc_id;subnet_ids=module.vpc.private_subnets}
module "rds" {source="../../modules/rds";name="microshop-dev";subnet_ids=module.vpc.private_subnets;password=var.db_password}
module "redis" {source="../../modules/redis";name="microshop-dev";subnet_ids=module.vpc.private_subnets}
module "mq" {source="../../modules/mq";name="microshop-dev";password=var.mq_password}

