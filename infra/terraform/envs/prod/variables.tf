variable "region" {
  type    = string
  default = "ap-south-1"
}
variable "db_password" {
  type      = string
  sensitive = true
}
variable "mq_password" {
  type      = string
  sensitive = true
}
variable "db_backup_retention_period" {
  type    = number
  default = 30
}
variable "db_deletion_protection" {
  type    = bool
  default = true
}
variable "db_storage_encrypted" {
  type    = bool
  default = true
}
variable "db_multi_az" {
  type    = bool
  default = true
}
variable "cluster_endpoint_public_access" {
  type    = bool
  default = false
}
