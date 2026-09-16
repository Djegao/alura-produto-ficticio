# Gera o deck inicial da Aula 2 duplicando as bases do deck da Aula 1 (e duas
# telas do deck atual da Aula 2) via PowerPoint COM. O conteúdo vem do JSON
# escrito por parse-script.py. O Diego finaliza no Google Slides.
#
#   powershell -File gerar-aula2.ps1 -Spec aula2-spec.json -Aula1 "..\..\..\..\Downloads\Aula 1 6498.pptx" -Aula2 "..\Aula 2 6498.pptx" -Out "..\Aula 2 6498 - inicial.pptx"
#
# Feche o PowerPoint antes de rodar.
param(
  [string]$Spec  = "$PSScriptRoot\aula2-spec.json",
  [string]$Aula1 = "C:\Users\PC Studio 2\Downloads\Aula 1 6498.pptx",
  [string]$Aula2 = "C:\Users\PC Studio 2\Downloads\Aula 2 6498.pptx",
  [string]$Out   = "C:\Users\PC Studio 2\Desktop\6498 Evals\alura-produto-ficticio\slides\Aula 2 6498 - inicial.pptx",
  [switch]$SemNotas
)
$ErrorActionPreference = 'Stop'
$itens = Get-Content -Raw -Encoding UTF8 $Spec | ConvertFrom-Json

# Índice das formas em cada base (ZOrderPosition, conferido em 03/09)
$BASES = @{
  'A1·22' = @{ slide = 22; title = 4 }
  'A1·5'  = @{ slide = 5;  title = 3; sub = 4 }
  'A1·10' = @{ slide = 10; title = 5 }
  'A1·16' = @{ slide = 16; title = 2; sub = 17; items = @(7, 11, 19); hide = @{ 2 = @(8, 9, 10, 11); 3 = @(12, 18, 19) } }
  'A1·27' = @{ slide = 27; title = 2; items = @(7, 11, 14); hide = @{ 2 = @(8, 9, 10, 11); 3 = @(12, 13, 14) } }
  'A1·21' = @{ slide = 21; title = 17; sub = 18; rotulos = @(20, 21, 22); perguntas = @(23, 24, 25); paragrafos = @(8, 12, 15); ex = @(32, 33, 34) }
  'A2·13' = @{ a2 = 13; title = 4; delete = @(5, 1) }
  'A2·19' = @{ a2 = 19; title = 5; sub = 6; delete = @(7, 4, 1); cardOpiniao = @(9, 5); cardCriterio = @(10, 5) }
}

function Set-Texto($shape, [string]$texto) {
  if ($null -eq $shape -or -not $shape.HasTextFrame) { return }
  $shape.TextFrame.TextRange.Text = ($texto -replace "\n", "`r")
}

$app = New-Object -ComObject PowerPoint.Application
$app.DisplayAlerts = 1  # ppAlertsNone
Copy-Item -Force $Aula1 $Out
$pres = $app.Presentations.Open($Out, $false, $false, $false)
$nOrig = $pres.Slides.Count

# Traz as duas bases do deck da Aula 2 pro fim do deck de trabalho
$idxA2 = @{}
foreach ($k in @('A2·13', 'A2·19')) {
  $n = $BASES[$k].a2
  [void]$pres.Slides.InsertFromFile($Aula2, $pres.Slides.Count, $n, $n)
  $idxA2[$k] = $pres.Slides.Count
}
$nBases = $pres.Slides.Count

function Nova-Base([string]$base) {
  $b = $BASES[$base]
  $src = if ($b.ContainsKey('a2')) { $pres.Slides.Item($idxA2[$base]) } else { $pres.Slides.Item($b.slide) }
  $dup = $src.Duplicate()
  $dup.MoveTo($pres.Slides.Count)
  return $pres.Slides.Item($pres.Slides.Count)
}

function Remove-Formas($slide, [int[]]$indices) {
  # apaga do maior pro menor índice pra não deslocar os outros
  $shapes = @()
  foreach ($i in ($indices | Sort-Object -Descending)) { $shapes += $slide.Shapes.Item($i) }
  foreach ($s in $shapes) { $s.Delete() }
}

$feitos = 0
foreach ($it in $itens) {
  $b = $BASES[$it.base]
  if ($null -eq $b) { Write-Warning "$($it.video) #$($it.n): base desconhecida '$($it.base)' — pulado"; continue }
  $sl = Nova-Base $it.base
  $S = $sl.Shapes

  if ($b.ContainsKey('title')) { Set-Texto $S.Item($b.title) $it.title }
  if ($b.ContainsKey('sub') -and $it.sub -and -not $b.ContainsKey('cardOpiniao')) {
    Set-Texto $S.Item($b.sub) $it.sub
    # hero (A1·5): título com mais de 20 caracteres quebra em duas linhas e cobre o subtítulo
    if ($it.base -eq 'A1·5' -and $it.title.Length -gt 20) { $S.Item($b.sub).Top += 110 }
  }

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

  if ($b.ContainsKey('cardOpiniao')) {
    $sub = $it.sub
    $mo = [regex]::Match($sub, 'OPINIÃO:\s*"([^"]+)"')
    $mc = [regex]::Match($sub, 'CRITÉRIO VERIFICÁVEL:\s*"([^"]+)"')
    if ($mo.Success) { Set-Texto $S.Item($b.cardOpiniao[0]).GroupItems.Item($b.cardOpiniao[1]) ('“' + $mo.Groups[1].Value + '”') }
    if ($mc.Success) { Set-Texto $S.Item($b.cardCriterio[0]).GroupItems.Item($b.cardCriterio[1]) ('“' + $mc.Groups[1].Value + '”') }
    # o subtítulo da tela é só a linha de apoio, não os cards
    $linha = ($sub -split 'OPINIÃO:')[0].Trim()
    if ($linha) { Set-Texto $S.Item($b.sub) $linha }   # vazio = mantém o subtítulo original da base
  }

  if ($b.ContainsKey('delete')) { Remove-Formas $sl $b.delete }

  if ($it.PSObject.Properties['tabela'] -and $it.tabela -and $it.table.Count) {
    # statement vira título no alto + tabela nativa embaixo (fundo escuro da base)
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
    $tb = $S.AddTable($rows, $cols, 460, 370, 1000, 60 * $rows)
    $tbl = $tb.Table
    for ($r = 1; $r -le $rows; $r++) {
      for ($c = 1; $c -le $cols; $c++) {
        $cell = $tbl.Cell($r, $c)
        $cell.Shape.TextFrame.TextRange.Text = [string]$it.table[$r - 1][$c - 1]
        $cell.Shape.TextFrame.TextRange.Font.Size = 26
        $cell.Shape.TextFrame.TextRange.Font.Color.RGB = 0xFFFFFF
        $cell.Shape.TextFrame.TextRange.Font.Bold = ($r -eq 1)
        $cell.Shape.Fill.ForeColor.RGB = if ($r -eq 1) { 0x5A2E10 } else { 0x1A1A1A }  # BGR: azul escuro / cinza
        if ($c -gt 1) { $cell.Shape.TextFrame.TextRange.ParagraphFormat.Alignment = 2 }
      }
    }
  }

  if (-not $SemNotas -and $it.notes) {
    try {
      $ph = $null
      foreach ($ns in $sl.NotesPage.Shapes) {
        if ($ns.Type -eq 14 -and $ns.PlaceholderFormat.Type -eq 2) { $ph = $ns }   # msoPlaceholder + ppPlaceholderBody
      }
      if ($null -eq $ph) { throw 'nenhum placeholder de corpo na pagina de notas' }
      $ph.TextFrame.TextRange.Text = ($it.notes -replace "\n", "`r")
    } catch { Write-Warning "$($it.video) #$($it.n): sem placeholder de notas ($_)" }
  }
  $feitos++
}

# Apaga as bases (originais da Aula 1 + as duas inseridas)
for ($i = $nBases; $i -ge 1; $i--) { $pres.Slides.Item($i).Delete() }

$pres.Save()
$total = $pres.Slides.Count
$pres.Close()
$app.Quit()
Write-Host "OK: $feitos slides gerados, $total no arquivo -> $Out"
