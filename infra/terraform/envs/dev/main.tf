terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" { region = var.region }

module "vpc" {
  source             = "../../modules/vpc"
  name               = "microshop-dev"
  cidr               = "10.20.0.0/16"
  azs                = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
  private_subnets    = ["10.20.1.0/24", "10.20.2.0/24", "10.20.3.0/24"]
  public_subnets     = ["10.20.101.0/24", "10.20.102.0/24", "10.20.103.0/24"]
  single_nat_gateway = true
}

module "ecr" {
  source       = "../../modules/ecr"
  repositories = ["frontend", "api-gateway", "user-service", "product-service", "order-service", "payment-service", "notification-service"]
}

module "eks" {
  source                         = "../../modules/eks"
  name                           = "microshop-dev"
  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = var.cluster_endpoint_public_access
}

module "rds" {
  source                  = "../../modules/rds"
  name                    = "microshop-dev"
  subnet_ids              = module.vpc.private_subnets
  password                = var.db_password
  backup_retention_period = var.db_backup_retention_period
  deletion_protection     = var.db_deletion_protection
  storage_encrypted       = var.db_storage_encrypted
  multi_az                = var.db_multi_az
  skip_final_snapshot     = true
}

module "redis" {
  source     = "../../modules/redis"
  name       = "microshop-dev"
  subnet_ids = module.vpc.private_subnets
}

module "mq" {
  source     = "../../modules/mq"
  name       = "microshop-dev"
  subnet_ids = module.vpc.private_subnets
  password   = var.mq_password
}
