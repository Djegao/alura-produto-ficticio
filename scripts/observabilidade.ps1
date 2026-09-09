# Liga/desliga a exportacao pro Langfuse SEM tocar em codigo, para a demo
# "antes/depois" da Aula 3 (video 3.2).
#
# O instrumentation.js le LANGFUSE_SECRET_KEY / LANGFUSE_PUBLIC_KEY /
# LANGFUSE_BASE_URL do .env. Sem essas variaveis o app roda normalmente e
# ate gera trace_id, so nao exporta nada para o dashboard. E exatamente
# esse contraste que a aula mostra.
#
# Uso:
#   .\scripts\observabilidade.ps1 preparar   # gera .env a partir do Railway
#   .\scripts\observabilidade.ps1 off        # esconde as chaves do Langfuse
#   .\scripts\observabilidade.ps1 on         # devolve as chaves
#   .\scripts\observabilidade.ps1 status     # mostra o estado atual
#
# Depois de cada troca, reinicie o servidor (Ctrl+C e npm start): as
# variaveis sao lidas uma vez, na subida do processo.
#
# ATENCAO: arquivo em ASCII puro de proposito. O PowerShell 5.1 le scripts
# como ANSI, e acento/travessao corrompem o parser.

param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('preparar', 'on', 'off', 'status')]
  [string]$Acao
)

$ErrorActionPreference = 'Stop'

$raiz = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $raiz '.env'
$guardaPath = Join-Path $raiz '.env.langfuse-guardado'

function Escrever($caminho, $linhas) {
  Set-Content -Path $caminho -Value $linhas -Encoding utf8
}

switch ($Acao) {

  'preparar' {
    if (Test-Path $envPath) {
      Write-Host "[!] .env ja existe, nao vou sobrescrever." -ForegroundColor Yellow
      Write-Host "    Apague manualmente se quiser regerar do Railway."
      break
    }
    Write-Host "Gerando .env a partir das variaveis do Railway..."
    $kv = railway variable list --kv
    if (-not $kv) {
      throw "railway variable list nao devolveu nada. Rode 'railway login' e 'railway link' antes."
    }
    Escrever $envPath $kv
    Write-Host "[ok] .env criado com $((Get-Content $envPath).Count) variaveis." -ForegroundColor Green
    Write-Host "     Esse arquivo tem segredos e esta no .gitignore."
  }

  'off' {
    if (-not (Test-Path $envPath)) {
      throw ".env nao encontrado. Rode: .\scripts\observabilidade.ps1 preparar"
    }
    if (Test-Path $guardaPath) {
      Write-Host "[!] Ja esta desligado (existe .env.langfuse-guardado)." -ForegroundColor Yellow
      break
    }
    $todas = Get-Content $envPath
    $doLangfuse = $todas | Where-Object { $_ -match '^\s*LANGFUSE_' }
    if (-not $doLangfuse) {
      throw "Nenhuma variavel LANGFUSE_ no .env, nada a desligar."
    }
    Escrever $guardaPath $doLangfuse
    Escrever $envPath ($todas | Where-Object { $_ -notmatch '^\s*LANGFUSE_' })
    Write-Host "[ok] Observabilidade DESLIGADA ($(@($doLangfuse).Count) variaveis guardadas)." -ForegroundColor Green
    Write-Host "     Reinicie o servidor: Ctrl+C e depois npm start"
  }

  'on' {
    if (-not (Test-Path $guardaPath)) {
      Write-Host "[!] Nada guardado, provavelmente ja esta ligado." -ForegroundColor Yellow
      break
    }
    $atuais = Get-Content $envPath | Where-Object { $_ -notmatch '^\s*LANGFUSE_' }
    Escrever $envPath (@($atuais) + @(Get-Content $guardaPath))
    Remove-Item $guardaPath -Force
    Write-Host "[ok] Observabilidade LIGADA." -ForegroundColor Green
    Write-Host "     Reinicie o servidor: Ctrl+C e depois npm start"
    Write-Host "     Lembre do lag: o trace leva ~45s para aparecer no Langfuse."
  }

  'status' {
    if (-not (Test-Path $envPath)) {
      Write-Host "sem .env. Rode: .\scripts\observabilidade.ps1 preparar"
      break
    }
    $tem = @(Get-Content $envPath | Where-Object { $_ -match '^\s*LANGFUSE_' }).Count
    if ($tem -gt 0) {
      Write-Host "LIGADA - $tem variaveis LANGFUSE_ ativas no .env" -ForegroundColor Green
    } else {
      Write-Host "DESLIGADA - nenhuma variavel LANGFUSE_ no .env" -ForegroundColor Yellow
    }
  }
}
