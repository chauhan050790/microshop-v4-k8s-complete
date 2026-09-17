terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" { region = var.region }

resource "aws_security_group" "managed_services" {
  name        = "microshop-dev-managed-services"
  description = "DEV access to RDS, Redis, and Amazon MQ from the VPC"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "PostgreSQL from the VPC"
    protocol    = "tcp"
    from_port   = 5432
    to_port     = 5432
    cidr_blocks = [module.vpc.cidr]
  }

  ingress {
    description = "Redis TLS from the VPC"
    protocol    = "tcp"
    from_port   = 6379
    to_port     = 6379
    cidr_blocks = [module.vpc.cidr]
  }

  ingress {
    description = "RabbitMQ TLS from the VPC"
    protocol    = "tcp"
    from_port   = 5671
    to_port     = 5671
    cidr_blocks = [module.vpc.cidr]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

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
  node_instance_types            = ["c7i-flex.large"]
  node_min_size                  = 1
  node_max_size                  = 3
  node_desired_size              = 1
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
  instance_class          = "db.t3.micro"
  vpc_security_group_ids  = [aws_security_group.managed_services.id]
}

module "redis" {
  source             = "../../modules/redis"
  name               = "microshop-dev"
  subnet_ids         = module.vpc.private_subnets
  security_group_ids = [aws_security_group.managed_services.id]
}

module "mq" {
  source          = "../../modules/mq"
  name            = "microshop-dev"
  subnet_ids      = module.vpc.private_subnets
  password        = var.mq_password
  instance_type   = "mq.m5.large"
  security_groups = [aws_security_group.managed_services.id]
}
