variable "name" { type = string }
variable "subnet_ids" { type = list(string) }
variable "password" {
  type      = string
  sensitive = true
}
variable "deployment_mode" {
  type    = string
  default = "SINGLE_INSTANCE"
}
variable "publicly_accessible" {
  type    = bool
  default = false
}
variable "instance_type" {
  type    = string
  default = "mq.t3.micro"
}

resource "aws_mq_broker" "mq" {
  broker_name         = var.name
  engine_type         = "RabbitMQ"
  engine_version      = "3.13"
  host_instance_type  = var.instance_type
  publicly_accessible = var.publicly_accessible
  deployment_mode     = var.deployment_mode
  subnet_ids          = var.deployment_mode == "SINGLE_INSTANCE" ? [var.subnet_ids[0]] : var.subnet_ids
  user {
    username = "microshop"
    password = var.password
  }
  logs {
    general = true
  }
}

output "endpoint" { value = aws_mq_broker.mq.instances[0].endpoints[0] }
