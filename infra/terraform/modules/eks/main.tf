variable "name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "cluster_version" {
  type    = string
  default = "1.31"
}
variable "cluster_endpoint_public_access" {
  type    = bool
  default = false
}
variable "node_instance_types" {
  type    = list(string)
  default = ["m6i.large"]
}
variable "node_min_size" {
  type    = number
  default = 2
}
variable "node_max_size" {
  type    = number
  default = 8
}
variable "node_desired_size" {
  type    = number
  default = 3
}

module "eks" {
  source                         = "terraform-aws-modules/eks/aws"
  version                        = "20.31.6"
  cluster_name                   = var.name
  cluster_version                = var.cluster_version
  vpc_id                         = var.vpc_id
  subnet_ids                     = var.subnet_ids
  cluster_endpoint_public_access = var.cluster_endpoint_public_access
  enable_irsa                    = true
  eks_managed_node_groups = {
    default = {
      instance_types = var.node_instance_types
      min_size       = var.node_min_size
      max_size       = var.node_max_size
      desired_size   = var.node_desired_size
      subnet_ids     = var.subnet_ids
    }
  }
}

output "cluster_name" { value = module.eks.cluster_name }
output "cluster_endpoint" { value = module.eks.cluster_endpoint }
