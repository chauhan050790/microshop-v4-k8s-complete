variable "name"{type=string} variable "cidr"{type=string}
module "vpc" {
 source="terraform-aws-modules/vpc/aws";version="5.13.0";name=var.name;cidr=var.cidr
 azs=["ap-south-1a","ap-south-1b","ap-south-1c"]
 private_subnets=["10.0.1.0/24","10.0.2.0/24","10.0.3.0/24"]
 public_subnets=["10.0.101.0/24","10.0.102.0/24","10.0.103.0/24"]
 enable_nat_gateway=true;single_nat_gateway=false;enable_dns_hostnames=true
}
output "vpc_id"{value=module.vpc.vpc_id} output "private_subnets"{value=module.vpc.private_subnets}

