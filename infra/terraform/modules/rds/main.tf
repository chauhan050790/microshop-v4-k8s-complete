variable "name"{type=string} variable "subnet_ids"{type=list(string)} variable "password"{type=string,sensitive=true}
resource "aws_db_subnet_group" "db"{name=var.name,subnet_ids=var.subnet_ids}
resource "aws_db_instance" "db"{identifier=var.name,engine="postgres",engine_version="16",instance_class="db.t4g.medium",allocated_storage=50,storage_type="gp3",db_name="microshop",username="microshop",password=var.password,db_subnet_group_name=aws_db_subnet_group.db.name,publicly_accessible=false,storage_encrypted=true,backup_retention_period=7,deletion_protection=true,skip_final_snapshot=false}
output "endpoint"{value=aws_db_instance.db.address}

