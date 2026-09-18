$ErrorActionPreference = 'Stop'

$accountId = '185188589391'
$region = 'ap-south-1'
$tag = 'b49abff149809cc83b13e7b7089125ff7624cc73'
$registry = "${accountId}.dkr.ecr.${region}.amazonaws.com"
$repoRoot = 'C:\Users\VChauhan\Desktop\study\project\microshop-v4-k8s-complete'
$services = @(
  'frontend',
  'api-gateway',
  'user-service',
  'product-service',
  'order-service',
  'payment-service',
  'notification-service'
)

Write-Host "Logging in to ECR: $registry"
aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $registry

foreach ($service in $services) {
  $image = "${registry}/microshop/${service}:${tag}"
  Write-Host "Building $service -> $image"
  docker build -t $image "$repoRoot\apps\$service"
  docker push $image
}

Write-Host "Images pushed successfully for tag $tag"
