variable "name"{type=string} variable "password"{type=string,sensitive=true}
resource "aws_mq_broker" "mq"{broker_name=var.name,engine_type="RabbitMQ",engine_version="3.13",host_instance_type="mq.t3.micro",publicly_accessible=false,deployment_mode="SINGLE_INSTANCE",user{username="microshop",password=var.password}}

