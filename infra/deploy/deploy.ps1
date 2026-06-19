# ============================================================
# deploy.ps1 - Script de Deploy Automatico - Explora Pet
# Uso: .\deploy.ps1 "mensagem do commit"
# Uso sem mensagem: .\deploy.ps1  (usa mensagem automatica)
# ============================================================

param(
    [string]$Mensagem = ""
)

# Define mensagem automatica se nao foi fornecida
if ($Mensagem -eq "") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $Mensagem = "chore: deploy automatico - $timestamp"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EXPLORA PET - DEPLOY AUTOMATICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se ha alteracoes para commitar
$status = git status --porcelain
if ($status) {
    Write-Host "[1/3] Adicionando arquivos alterados..." -ForegroundColor Yellow
    git add -A

    Write-Host "[2/3] Fazendo commit: '$Mensagem'" -ForegroundColor Yellow
    git commit -m $Mensagem

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha no commit!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[1/3] Nenhuma alteracao local. Usando ultimo commit existente..." -ForegroundColor Gray
}

Write-Host "[3/3] Enviando para GitHub (main)..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  DEPLOY DISPARADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "  O Render vai iniciar o deploy em" -ForegroundColor Green
    Write-Host "  alguns segundos automaticamente." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acompanhe em: https://dashboard.render.com" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERRO: Falha ao enviar para o GitHub!" -ForegroundColor Red
    Write-Host "Verifique sua conexao e permissoes." -ForegroundColor Red
    exit 1
}
