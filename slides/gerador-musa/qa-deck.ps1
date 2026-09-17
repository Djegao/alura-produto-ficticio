# QA do deck gerado por gerar-aula4-meio.ps1. So LEITURA no .pptx.
#
# Confere, slide a slide:
#   - TITULO: centro da TINTA renderizada no PNG (qa-tinta.py) contra o eixo
#     esperado (tags CX/CY). Grava aula4-meio-calibracao.json: rode o
#     gerador de novo e o QA de novo ate passar (normalmente 1 volta).
#   - Vazamento: texto maior que a caixa, ou fora do slide.
#   - Legibilidade: nenhum texto abaixo de MinFonte (24 pt) depois da escala.
#   - Composicao: bbox de tudo que tem ROLE centralizado em V (e em H, menos
#     no layout de coluna com imagem).
#   - Animacao forcada: tudo que existe no frame k existe identico, na mesma
#     posicao, no frame k+1.
# E exporta um PNG por slide pra revisao visual.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\qa-deck.ps1 [-Png pasta]
# Precisa de python com Pillow e numpy (qa-tinta.py).
param(
  [string]$Deck = "$PSScriptRoot\..\Aula 4 6498 - meio episodio D.pptx",
  [string]$Png  = '',
  [double]$Tol  = 6,
  [double]$MinFonte = 24
)
$ErrorActionPreference = 'Stop'
$W = 1920; $H = 1080
$app = New-Object -ComObject PowerPoint.Application
$pres = $app.Presentations.Open((Resolve-Path $Deck).Path, $true, $false, $false)
if (-not $Png) { $Png = Join-Path $env:TEMP 'qa-deck-png' }
New-Item -ItemType Directory -Force $Png | Out-Null
$titulos = @()

$falhas = @(); $anterior = $null
function Assinatura($sl) {
  $set = @{}
  foreach ($s in $sl.Shapes) {
    $t = ''; if ($s.HasTextFrame -and $s.TextFrame.HasText) { $t = $s.TextFrame.TextRange.Text }
    $set["{0:N1}|{1:N1}|{2:N1}|{3:N1}|{4}" -f $s.Left, $s.Top, $s.Width, $s.Height, $t] = 1
  }
  return $set
}

foreach ($sl in $pres.Slides) {
  $i = $sl.SlideIndex
  $layout = $sl.Tags.Item('LAYOUT'); $build = $sl.Tags.Item('BUILD'); $item = $sl.Tags.Item('ITEM')
  $esq = 1e9; $dir = -1e9; $top = 1e9; $bot = -1e9; $temRole = $false
  foreach ($s in $sl.Shapes) {
    $role = $s.Tags.Item('ROLE')
    $temTexto = ($s.HasTextFrame -and $s.TextFrame.HasText)
    if ($temTexto) {
      $tr = $s.TextFrame.TextRange; $tf = $s.TextFrame
      $bl = $tr.BoundLeft; $bt = $tr.BoundTop; $bw = $tr.BoundWidth; $bh = $tr.BoundHeight
      $util = $s.Height - $tf.MarginTop - $tf.MarginBottom
      if ($role -ne '' -and $tf.AutoSize -eq 0 -and $bh -gt $util + 2) { $falhas += "slide $i ($layout): texto vaza a caixa em altura ($([int]$bh) > $([int]$util)): '$($tr.Text.Substring(0, [Math]::Min(40, $tr.Text.Length)))'" }
      if ($role -ne '' -and ($bl -lt 20 -or $bt -lt 20 -or ($bl + $bw) -gt ($W - 20) -or ($bt + $bh) -gt ($H - 20))) { $falhas += "slide $i ($layout): texto fora da area segura: '$($tr.Text.Substring(0, [Math]::Min(40, $tr.Text.Length)))'" }
      if ($role -ne '' -and $role -ne 'IMAGEM' -and $tr.Font.Size -lt $MinFonte) { $falhas += ("slide {0} ({1}): texto de {2:N0} pt, abaixo do minimo legivel de {3} pt: '{4}'" -f $i, $layout, $tr.Font.Size, $MinFonte, $tr.Text.Substring(0, [Math]::Min(40, $tr.Text.Length))) }
      if ($role -eq 'TITULO') {
        # o centro real e' medido na tinta do PNG (qa-tinta.py); BoundLeft do
        # PowerPoint desloca ~8 pt e a caixa de linha nao e' onde a letra esta
        $cy = $(if ($s.Tags.Item('CY') -ne '') { [double]$s.Tags.Item('CY') } else { $null })
        $rgb = $tr.Font.Color.RGB
        $cal = $(if ($s.Tags.Item('CAL') -ne '') { [double]$s.Tags.Item('CAL') } else { 0 })
        $titulos += [pscustomobject]@{ slide = $i; item = $item; cal = $cal; layout = $layout; png = ("s{0:D3}.png" -f $i)
          l = $s.Left; t = $s.Top; w = $s.Width; h = $s.Height; cx = [double]$s.Tags.Item('CX'); cy = $cy
          cor = '{0:X2}{1:X2}{2:X2}' -f ($rgb -band 255), (($rgb -shr 8) -band 255), (($rgb -shr 16) -band 255) }
        if ($tr.ParagraphFormat.Alignment -ne 2 -or $tf.VerticalAnchor -ne 3) { $falhas += "slide $i ($layout): titulo sem alinhamento central/ancora no meio" }
      }
    }
    if ($role -ne '' -and $role -ne 'IMAGEM' -and $role -ne 'VEU') {
      $temRole = $true
      $t = $s.Top; $b = $s.Top + $s.Height; $l = $s.Left; $r = $s.Left + $s.Width
      if ($temTexto -and $s.Type -eq 17) { $t = $bt; $b = $bt + $bh }
      if ($t -lt $top) { $top = $t }; if ($b -gt $bot) { $bot = $b }; if ($l -lt $esq) { $esq = $l }; if ($r -gt $dir) { $dir = $r }
    }
  }
  # composicao: so no frame completo (frames parciais herdam a posicao)
  $completo = ($build -eq '' -or ($build.Split('/')[0] -eq $build.Split('/')[1]))
  if ($temRole -and $completo -and $layout -notin @('divisor', 'circulo')) {
    $dyC = ($top + $bot) / 2 - $H / 2
    if ([Math]::Abs($dyC) -gt 8) { $falhas += ("slide {0} ({1}): composicao descentralizada em V dy={2:N1}" -f $i, $layout, $dyC) }
    if ($layout -ne 'imagem') {
      $dxC = ($esq + $dir) / 2 - $W / 2
      if ([Math]::Abs($dxC) -gt 12) { $falhas += ("slide {0} ({1}): composicao descentralizada em H dx={2:N1}" -f $i, $layout, $dxC) }
    }
    if ($top -lt 40 -or $bot -gt $H - 40) { $falhas += ("slide {0} ({1}): composicao encosta na borda (top={2:N0} bot={3:N0})" -f $i, $layout, $top, $bot) }
  }
  # animacao forcada: frame anterior do mesmo item contido neste
  $sig = Assinatura $sl
  if ($anterior -and $anterior.item -eq $item -and $build -ne '') {
    foreach ($k in $anterior.sig.Keys) { if (-not $sig.ContainsKey($k)) { $falhas += "slide $i ($layout): frame anterior tem forma que sumiu/mudou de posicao: $k"; break } }
  }
  $anterior = @{ item = $item; sig = $sig }
  $sl.Export(("{0}\s{1:D3}.png" -f $Png, $i), 'PNG', 1920, 1080)
  Write-Host ("{0,3}  {1,-6} {2,-10} build {3}" -f $i, $sl.Tags.Item('VIDEO'), $layout, $build)
}
$n = $pres.Slides.Count
$semTag = @($pres.Slides | Where-Object { $_.Tags.Item('LAYOUT') -eq '' }).Count
if ($semTag) { $falhas += "$semTag slide(s) sem tag LAYOUT: o deck nao saiu do gerador (ou o gerador quebrou no meio)" }
$pres.Close(); $app.Quit()
# centralizacao dos titulos pela tinta renderizada
$json = Join-Path $Png 'titulos.json'
[IO.File]::WriteAllText($json, ($titulos | ConvertTo-Json -Depth 3), (New-Object Text.UTF8Encoding $false))
$saida = & python "$PSScriptRoot\qa-tinta.py" $Png $json $Tol "$PSScriptRoot\aula4-meio-calibracao.json"
foreach ($ln in $saida) { if ($ln -like 'FALHA*') { $falhas += $ln.Substring(6) } else { Write-Host $ln } }
Write-Host ''
if ($falhas.Count) { Write-Host "QA: $($falhas.Count) problema(s) em $n slides:"; $falhas | ForEach-Object { Write-Host "  - $_" } ; exit 1 }
Write-Host "QA: OK, $n slides sem problema."
