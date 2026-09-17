variable "name" { type = string }
variable "subnet_ids" { type = list(string) }
variable "password" {
  type      = string
  sensitive = true
}
variable "database_name" {
  type    = string
  default = "microshop"
}
variable "username" {
  type    = string
  default = "microshop"
}
variable "instance_class" {
  type    = string
  default = "db.t4g.medium"
}
variable "allocated_storage" {
  type    = number
  default = 50
}
variable "backup_retention_period" {
  type    = number
  default = 7
}
variable "storage_encrypted" {
  type    = bool
  default = true
}
variable "deletion_protection" {
  type    = bool
  default = true
}
variable "multi_az" {
  type    = bool
  default = true
}
variable "vpc_security_group_ids" {
  type    = list(string)
  default = []
}
variable "skip_final_snapshot" {
  type    = bool
  default = false
}

resource "aws_db_subnet_group" "db" {
  name       = "${var.name}-db"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "db" {
  identifier                 = var.name
  engine                     = "postgres"
  engine_version             = "16"
  instance_class             = var.instance_class
  allocated_storage          = var.allocated_storage
  storage_type               = "gp3"
  db_name                    = var.database_name
  username                   = var.username
  password                   = var.password
  db_subnet_group_name       = aws_db_subnet_group.db.name
  backup_retention_period    = var.backup_retention_period
  storage_encrypted          = var.storage_encrypted
  deletion_protection        = var.deletion_protection
  multi_az                   = var.multi_az
  publicly_accessible        = false
  vpc_security_group_ids     = var.vpc_security_group_ids
  auto_minor_version_upgrade = true
  skip_final_snapshot        = var.skip_final_snapshot
  copy_tags_to_snapshot      = true
}

output "endpoint" { value = aws_db_instance.db.address }
output "port" { value = aws_db_instance.db.port }
output "database_name" { value = aws_db_instance.db.db_name }
