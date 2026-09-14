variable "name"{type=string} variable "subnet_ids"{type=list(string)}
resource "aws_elasticache_subnet_group" "redis"{name=var.name,subnet_ids=var.subnet_ids}
resource "aws_elasticache_replication_group" "redis"{replication_group_id=var.name,description="MicroShop Redis",engine="redis",node_type="cache.t4g.small",num_cache_clusters=2,automatic_failover_enabled=true,multi_az_enabled=true,subnet_group_name=aws_elasticache_subnet_group.redis.name,at_rest_encryption_enabled=true,transit_encryption_enabled=true}
output "endpoint"{value=aws_elasticache_replication_group.redis.primary_endpoint_address}

