param(
    [ValidateSet("dev", "prod")]
    [string]$Environment = "dev",

    [string]$Region = "ap-south-1",

    [switch]$PlanOnly
)

$ErrorActionPreference = "Stop"

$terraformDir = Join-Path $PSScriptRoot "envs/$Environment"
$tfvarsPath = Join-Path $terraformDir "terraform.tfvars"
$examplePath = Join-Path $terraformDir "terraform.tfvars.example"

if (-not (Test-Path $terraformDir)) {
    throw "Unknown environment '$Environment'. Expected a folder under $PSScriptRoot/envs."
}

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    throw "AWS CLI is required but was not found on PATH."
}

if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    throw "Terraform is required but was not found on PATH."
}

if (-not (Test-Path $tfvarsPath)) {
    if (Test-Path $examplePath) {
        Copy-Item $examplePath $tfvarsPath
        Write-Host "Created $tfvarsPath from the example file. Update the password values and rerun the script."
        exit 0
    }

    throw "Missing $tfvarsPath. Copy terraform.tfvars.example to terraform.tfvars and set the AWS secrets before provisioning."
}

Write-Host "Validating AWS credentials..."
aws sts get-caller-identity --output table | Out-Host

Push-Location $terraformDir
try {
    terraform init
    terraform validate

    if ($PlanOnly) {
        terraform plan -var-file=$tfvarsPath
    }
    else {
        terraform apply -var-file=$tfvarsPath -auto-approve
        $clusterName = "microshop-$Environment"
        aws eks update-kubeconfig --name $clusterName --region $Region
        Write-Host "EKS kubeconfig updated for cluster $clusterName in $Region"
    }
}
finally {
    Pop-Location
}

Write-Host "Next steps: configure the AWS Load Balancer Controller, External Secrets Operator, Argo CD, and kube-prometheus-stack using docs/platform-bootstrap.md."
