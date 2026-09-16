# Gera o deck inicial da Aula 3 (v1, pre-debate) reaproveitando slides JA
# FINALIZADOS de "Aula 2 6498 - inicial.pptx" como base de design -- os
# templates originais (Aula 1 6498.pptx / Aula 2 6498.pptx) nao existem
# nesta maquina (mesma situacao documentada em gerar-aula2.5.ps1).
#
# So LEITURA no arquivo fonte: ele e' copiado pra um arquivo novo antes de
# qualquer edicao, o original nunca e' aberto em modo escrita.
#
# Bases usadas (indice de slide e de forma confirmados por inspecao em
# 16/09, ver docs/aula3-bases.md):
#   divisor   -> slide 31 (A1.22)
#   hero      -> slide 42 (A1.5, fechamento da Aula 2 -- so titulo+sub sobrevivem)
#   statement -> slide 6  (A1.10)
#   build     -> slide 5  (A1.16)
#   lista     -> slide 37 (A1.27)
#   colunas3  -> slide 16 (A1.21 -- "Um criterio tem 4 partes", 3 colunas: rotulo/pergunta/paragrafo/ex)
#   tabela    -> modificador no statement (tabela nativa embaixo do titulo)
#
#   powershell -File gerar-aula3.ps1
#
# Feche o PowerPoint antes de rodar. O deck sai como
# "Aula 3 6498 - inicial.pptx" na pasta slides/, pra revisao no Google Slides.
param(
  [string]$Spec   = "$PSScriptRoot\aula3-spec.json",
  [string]$Fonte  = "$PSScriptRoot\..\Aula 2 6498 - inicial.pptx",
  [string]$Out    = "$PSScriptRoot\..\Aula 3 6498 - inicial.pptx",
  [switch]$SemNotas
)
$ErrorActionPreference = 'Stop'
$itens = Get-Content -Raw -Encoding UTF8 $Spec | ConvertFrom-Json

$BASES = @{
  'divisor'   = @{ slide = 31; title = 4 }
  'hero'      = @{ slide = 42; title = 3; sub = 4 }
  'statement' = @{ slide = 6;  title = 5 }
  'build'     = @{ slide = 5;  title = 2; sub = 17; items = @(7, 11, 19); hide = @{ 2 = @(8, 9, 10, 11); 3 = @(12, 18, 19) } }
  'lista'     = @{ slide = 37; title = 2; items = @(7, 11, 14); hide = @{ 2 = @(8, 9, 10, 11); 3 = @(12, 13, 14) } }
  'colunas3'  = @{ slide = 16; title = 17; sub = 18; rotulos = @(20, 21, 22); perguntas = @(23, 24, 25); paragrafos = @(8, 12, 15); ex = @(32, 33, 34) }
}

function Set-Texto($shape, [string]$texto) {
  if ($null -eq $shape -or -not $shape.HasTextFrame) { return }
  $shape.TextFrame.TextRange.Text = ($texto -replace "`n", "`r")
}

function Remove-Formas($slide, [int[]]$indices) {
  $shapes = @()
  foreach ($i in ($indices | Sort-Object -Descending)) { $shapes += $slide.Shapes.Item($i) }
  foreach ($s in $shapes) { $s.Delete() }
}

$app = New-Object -ComObject PowerPoint.Application
$app.DisplayAlerts = 1  # ppAlertsNone
Copy-Item -Force $Fonte $Out
$pres = $app.Presentations.Open($Out, $false, $false, $false)
$nOrig = $pres.Slides.Count   # apagados no fim -- so serviram de base

function Nova-Base([string]$kind) {
  $b = $BASES[$kind]
  $src = $pres.Slides.Item($b.slide)
  $dup = $src.Duplicate()
  $dup.MoveTo($pres.Slides.Count)
  $novo = $pres.Slides.Item($pres.Slides.Count)
  $novo.SlideShowTransition.Hidden = 0   # achado 16/09 na Aula 2.5: Duplicate() pode herdar slide oculto
  return $novo
}

$feitos = 0
foreach ($it in $itens) {
  $b = $BASES[$it.base]
  if ($null -eq $b) { Write-Warning "$($it.video) #$($it.n): base desconhecida '$($it.base)' -- pulado"; continue }
  $sl = Nova-Base $it.base
  $S = $sl.Shapes

  if ($b.ContainsKey('title')) { Set-Texto $S.Item($b.title) $it.title }
  if ($b.ContainsKey('sub') -and $it.sub -and -not $it.tabela) { Set-Texto $S.Item($b.sub) $it.sub }

  if ($b.ContainsKey('items')) {
    $bul = @($it.bullets)
    for ($k = 0; $k -lt 3; $k++) {
      if ($k -lt $bul.Count) { Set-Texto $S.Item($b.items[$k]) $bul[$k] }
    }
    $hide = @()
    if ($bul.Count -lt 3) { $hide += $b.hide[3] }
    if ($bul.Count -lt 2) { $hide += $b.hide[2] }
    if ($hide.Count) { Remove-Formas $sl $hide }
  }

  if ($b.ContainsKey('rotulos') -and $it.table.Count -ge 4) {
    for ($c = 0; $c -lt 3; $c++) {
      Set-Texto $S.Item($b.rotulos[$c])    $it.table[0][$c]
      Set-Texto $S.Item($b.perguntas[$c])  $it.table[1][$c]
      Set-Texto $S.Item($b.paragrafos[$c]) $it.table[2][$c]
      $ex = $S.Item($b.ex[$c]).TextFrame.TextRange
      $txt = $it.table[3][$c] -replace '^Ex\.:\s*', ''
      $ex.Text = "Ex.:`r$txt"
    }
  }

  if ($it.tabela -and $it.table.Count) {
    # statement vira titulo no alto + tabela nativa embaixo (mesmo padrao da Aula 2.5)
    $t = $S.Item($b.title); $t.Top = 110; $t.Height = 170; $t.Left = 300; $t.Width = 1320
    $t.TextFrame.TextRange.Font.Size = 60
    if ($it.sub) {
      $legenda = $S.AddTextbox(1, 300, 285, 1320, 60)
      $legenda.TextFrame.TextRange.Text = $it.sub
      $legenda.TextFrame.TextRange.Font.Size = 24
      $legenda.TextFrame.TextRange.Font.Color.RGB = 0xBBBBBB
      $legenda.TextFrame.TextRange.ParagraphFormat.Alignment = 2
    }
    $rows = $it.table.Count; $cols = $it.table[0].Count
    $rowH = [Math]::Min(60, [Math]::Floor(520 / $rows))
    $tb = $S.AddTable($rows, $cols, 460, 370, 1000, $rowH * $rows)
    $tbl = $tb.Table
    for ($r = 1; $r -le $rows; $r++) {
      for ($c = 1; $c -le $cols; $c++) {
        $cell = $tbl.Cell($r, $c)
        $cell.Shape.TextFrame.TextRange.Text = [string]$it.table[$r - 1][$c - 1]
        $cell.Shape.TextFrame.TextRange.Font.Size = 20
        $cell.Shape.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF
        $cell.Shape.TextFrame.TextRange.Font.Bold = ($r -eq 1)
        $cell.Shape.Fill.ForeColor.RGB = if ($r -eq 1) { 0x5A2E10 } else { 0x1A1A1A }
        if ($c -gt 1) { $cell.Shape.TextFrame.TextRange.ParagraphFormat.Alignment = 2 }
      }
    }
  }

  if (-not $SemNotas -and $it.notes) {
    try {
      $ph = $null
      foreach ($ns in $sl.NotesPage.Shapes) {
        if ($ns.Type -eq 14 -and $ns.PlaceholderFormat.Type -eq 2) { $ph = $ns }
      }
      if ($null -eq $ph) { throw 'nenhum placeholder de notas' }
      $ph.TextFrame.TextRange.Text = ($it.notes -replace "`n", "`r")
    } catch { Write-Warning "$($it.video) #$($it.n): sem placeholder de notas ($_)" }
  }
  $feitos++
}

for ($i = $nOrig; $i -ge 1; $i--) { $pres.Slides.Item($i).Delete() }

$pres.Save()
$total = $pres.Slides.Count
$pres.Close()
$app.Quit()
Write-Host "OK: $feitos slides gerados, $total no arquivo -> $Out"
