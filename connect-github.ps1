$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

$repoName = "my-site"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed. Download it from git-scm.com" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI is not installed. Run: winget install GitHub.cli" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
    gh auth login --web --git-protocol https
}

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

if (-not (git config user.email)) {
    git config user.email "user@example.com"
    git config user.name "User"
}

git add .
git commit -m "Initial commit" *> $null

gh repo create $repoName --public --source . --remote origin --push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Uploaded successfully: $repoName" -ForegroundColor Green
} else {
    Write-Host "Upload failed. Copy the messages above and send them to me." -ForegroundColor Red
}

Read-Host "Press Enter to exit"
