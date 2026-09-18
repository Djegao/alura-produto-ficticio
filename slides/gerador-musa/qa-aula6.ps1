# QA do deck da Aula 6. So LEITURA no .pptx.
#
# Confere, slide a slide:
#   - Vazamento: texto mais alto que a caixa, ou fora da area segura.
#   - Legibilidade: nenhum texto abaixo de MinFonte (10 pt neste deck de
#     720x405 pt = os 24 pt do deck 1920x1080 da Aula 4).
#   - Animacao forcada: tudo que existe no quadro k existe identico, na mesma
#     posicao, no quadro k+1 (assinatura Left|Top|Width|Height|Texto).
#   - Titulo centralizado: caixa centrada em H no slide e ancora no meio; o
#     centro da TINTA e medido no PNG por qa-aula6-tinta.py.
# E exporta um PNG por slide pra revisao visual.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\qa-aula6.ps1 [-Png pasta]
param(
  [string]$Deck = "$PSScriptRoot\..\Aula 6 6498 - conformidade.pptx",
  [string]$Manifesto = "$PSScriptRoot\aula6-manifesto.json",
  [string]$Png = '',
  [double]$Tol = 6,
  [double]$MinFonte = 10
)
$ErrorActionPreference = 'Stop'
$W = 720.0; $H = 405.0; $SEGURO = 14.0
if (-not $Png) { $Png = Join-Path $env:TEMP 'qa-aula6-png' }
New-Item -ItemType Directory -Force $Png | Out-Null
$man = Get-Content -Raw -Encoding UTF8 $Manifesto | ConvertFrom-Json

$app = New-Object -ComObject PowerPoint.Application

# referencia: um PNG por base, so com o chrome (sem conteudo)
$refDir = Join-Path $Png 'ref'
New-Item -ItemType Directory -Force $refDir | Out-Null
$refDeck = (Join-Path $PSScriptRoot 'aula6-referencia.pptx')
$refMan = Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot 'aula6-referencia.json') | ConvertFrom-Json
$rp = $app.Presentations.Open((Resolve-Path $refDeck).Path, $true, $false, $false)
foreach ($sl in $rp.Slides) {
  $sl.Export((Join-Path $refDir ($refMan[$sl.SlideIndex - 1].base + '.png')), 'PNG', 1440, 810)
}
$rp.Close()

$pres = $app.Presentations.Open((Resolve-Path $Deck).Path, $true, $false, $false)

function Assinatura($sl) {
  $set = @{}
  foreach ($s in $sl.Shapes) {
    $t = ''
    if ($s.HasTextFrame -and $s.TextFrame.HasText) { $t = $s.TextFrame.TextRange.Text }
    $set["{0:N1}|{1:N1}|{2:N1}|{3:N1}|{4}" -f $s.Left, $s.Top, $s.Width, $s.Height, $t] = 1
  }
  return $set
}

$falhas = @(); $anterior = $null; $titulos = @()
foreach ($sl in $pres.Slides) {
  $i = $sl.SlideIndex
  $info = $man[$i - 1]
  $rot = "slide $i ($($info.layout) $($info.quadro))"
  foreach ($s in $sl.Shapes) {
    if (-not ($s.HasTextFrame -and $s.TextFrame.HasText)) { continue }
    $tr = $s.TextFrame.TextRange
    $bl = $tr.BoundLeft; $bt = $tr.BoundTop; $bw = $tr.BoundWidth; $bh = $tr.BoundHeight
    $amostra = $tr.Text.Substring(0, [Math]::Min(46, $tr.Text.Length)) -replace "`r|`n", ' '
    if ($bh -gt $s.Height + 2.5) {
      $falhas += "$rot : texto mais alto que a caixa ($([int]$bh) > $([int]$s.Height)) em '$amostra'"
    }
    if ($bl -lt $SEGURO -or $bt -lt $SEGURO -or ($bl + $bw) -gt ($W - $SEGURO) -or ($bt + $bh) -gt ($H - $SEGURO)) {
      $falhas += ("$rot : texto fora da area segura (l={0:N0} t={1:N0} r={2:N0} b={3:N0}) em '$amostra'" -f $bl, $bt, ($bl + $bw), ($bt + $bh))
    }
    if ($tr.Font.Size -lt $MinFonte -and $info.layout -ne 'capa') {
      $falhas += ("$rot : texto de {0:N1} pt, abaixo do minimo de {1} pt em '$amostra'" -f $tr.Font.Size, $MinFonte)
    }
  }
  foreach ($s in $sl.Shapes) {
    if ($s.Left -lt -80 -or ($s.Left + $s.Width) -gt ($W + 80)) { continue }
    if ($s.Left -lt -0.5 -and $s.Width -lt 200 -and $s.HasTextFrame -and $s.TextFrame.HasText) {
      $falhas += "$rot : forma de texto comecando fora do slide"
    }
  }
  # titulo: primeira caixa de 630 pt de largura na faixa de cabecalho
  foreach ($s in $sl.Shapes) {
    if ($s.HasTextFrame -and $s.TextFrame.HasText -and [Math]::Abs($s.Width - 630) -lt 1 -and $s.Top -lt 60) {
      $tr = $s.TextFrame.TextRange
      if ($tr.ParagraphFormat.Alignment -ne 2 -or $s.TextFrame.VerticalAnchor -ne 3) {
        $falhas += "$rot : titulo sem alinhamento central / ancora no meio"
      }
      $titulos += [pscustomobject]@{ slide = $i; png = ("s{0:D3}.png" -f $i)
        l = $s.Left; t = $s.Top; w = $s.Width; h = $s.Height; rotulo = $rot
        ref = ("ref\{0}.png" -f $info.base) }
      break
    }
  }
  # animacao forcada
  $sig = Assinatura $sl
  if ($anterior -and $anterior.item -eq $info.item -and $info.quadro.Split('/')[0] -ne '1') {
    foreach ($k in $anterior.sig.Keys) {
      if (-not $sig.ContainsKey($k)) {
        $falhas += "$rot : quadro anterior tem forma que sumiu ou mudou de posicao -> $k"
        break
      }
    }
  }
  $anterior = @{ item = $info.item; sig = $sig }
  $sl.Export(("{0}\s{1:D3}.png" -f $Png, $i), 'PNG', 1440, 810)
}
$n = $pres.Slides.Count
$pres.Close(); $app.Quit()

$json = Join-Path $Png 'titulos.json'
[IO.File]::WriteAllText($json, ($titulos | ConvertTo-Json -Depth 3), (New-Object Text.UTF8Encoding $false))
$saida = & python "$PSScriptRoot\qa-aula6-tinta.py" $Png $json $Tol
foreach ($ln in $saida) {
  if ($ln -like 'FALHA*') { $falhas += $ln.Substring(6) } else { Write-Host $ln }
}

Write-Host ''
if ($falhas.Count) {
  Write-Host "QA: $($falhas.Count) problema(s) em $n slides:"
  $falhas | ForEach-Object { Write-Host "  - $_" }
  exit 1
}
Write-Host "QA: OK, $n slides sem problema. PNGs em $Png"
