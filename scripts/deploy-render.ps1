$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'backend'

if (-not $env:RENDER_API_KEY) {
  Write-Host 'RENDER_API_KEY is required for direct deployment.'
  exit 1
}

$serviceName = if ($env:RENDER_SERVICE_NAME) { $env:RENDER_SERVICE_NAME } else { 'salo-backend' }
$repoUrl = if ($env:RENDER_REPO_URL) { $env:RENDER_REPO_URL } else { '' }

if (-not $repoUrl) {
  Write-Host 'RENDER_REPO_URL is required for direct deployment.'
  exit 1
}

$headers = @{ Authorization = "Bearer $env:RENDER_API_KEY"; 'Content-Type' = 'application/json' }
$body = @{ serviceName = $serviceName; type = 'web_service'; repoUrl = $repoUrl; branch = 'main'; env = @{ PORT = '10000'; NODE_ENV = 'production'; JWT_SECRET = $env:JWT_SECRET; ADMIN_EMAIL = $env:ADMIN_EMAIL; ADMIN_PASSWORD = $env:ADMIN_PASSWORD; DATABASE_URL = $env:DATABASE_URL } } | ConvertTo-Json -Depth 10

try {
  $response = Invoke-RestMethod -Method Post -Uri 'https://api.render.com/v1/services' -Headers $headers -Body $body
  $response | ConvertTo-Json -Depth 10
} catch {
  Write-Host $_.Exception.Message
  exit 1
}
