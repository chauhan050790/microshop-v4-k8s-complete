variable "repositories" {
  type = list(string)
}

resource "aws_ecr_repository" "repo" {
  for_each             = toset(var.repositories)
  name                 = "microshop/${each.value}"
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "repo" {
  for_each   = aws_ecr_repository.repo
  repository = each.value.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 50
      }
      action = { type = "expire" }
    }]
  })
}

output "urls" {
  value = { for k, v in aws_ecr_repository.repo : k => v.repository_url }
}
