terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" { region = var.region }

module "vpc" {
  source          = "../../modules/vpc"
  name            = "microshop-prod"
  cidr            = "10.30.0.0/16"
  azs             = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
  private_subnets = ["10.30.1.0/24", "10.30.2.0/24", "10.30.3.0/24"]
  public_subnets  = ["10.30.101.0/24", "10.30.102.0/24", "10.30.103.0/24"]
}

module "ecr" {
  source       = "../../modules/ecr"
  repositories = ["frontend", "api-gateway", "user-service", "product-service", "order-service", "payment-service", "notification-service"]
}

module "eks" {
  source                         = "../../modules/eks"
  name                           = "microshop-prod"
  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = var.cluster_endpoint_public_access
}

module "rds" {
  source                  = "../../modules/rds"
  name                    = "microshop-prod"
  subnet_ids              = module.vpc.private_subnets
  password                = var.db_password
  backup_retention_period = var.db_backup_retention_period
  deletion_protection     = var.db_deletion_protection
  storage_encrypted       = var.db_storage_encrypted
  multi_az                = var.db_multi_az
  skip_final_snapshot     = false
}

module "redis" {
  source     = "../../modules/redis"
  name       = "microshop-prod"
  subnet_ids = module.vpc.private_subnets
}

module "mq" {
  source          = "../../modules/mq"
  name            = "microshop-prod"
  subnet_ids      = module.vpc.private_subnets
  password        = var.mq_password
  deployment_mode = "ACTIVE_STANDBY_MULTI_AZ"
}
