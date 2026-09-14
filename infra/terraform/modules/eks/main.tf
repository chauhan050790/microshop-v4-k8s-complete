variable "name"{type=string} variable "vpc_id"{type=string} variable "subnet_ids"{type=list(string)}
module "eks" {
 source="terraform-aws-modules/eks/aws";version="20.31.6";cluster_name=var.name;cluster_version="1.31"
 vpc_id=var.vpc_id;subnet_ids=var.subnet_ids;cluster_endpoint_public_access=true
 eks_managed_node_groups={default={instance_types=["m6i.large"],min_size=2,max_size=8,desired_size=3,subnet_ids=var.subnet_ids}}
}
output "cluster_name"{value=module.eks.cluster_name}

