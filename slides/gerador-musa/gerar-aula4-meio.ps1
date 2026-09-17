# Gera o deck do meio novo da Aula 4 (Episodio D, ciclo completo: 4.2.1 a
# 4.2.6 + 4.5) a partir de aula4-meio-spec.json.
#
# Diferente de gerar-aula4.ps1 (que so trocava o texto de 6 bases), este
# gerador usa as bases de "Aula 2 6498 - inicial.pptx" SO como fundo (azul,
# circulo, escuro, claro, coluna com imagem, capa) e desenha o conteudo de
# cada layout em formas nativas: conversa, tabela, cards, ramos, citacao,
# decisoes, regua, codigo, padrao, contraste, caminhos, timeline, criterio,
# numeros, ciclo, lista. Pedido do Diego (17/09): variar o tipo de slide e
# centralizar os titulos H e V.
#
# Tres regras que o QA (qa-deck.ps1) confere:
#   1. Todo titulo e' caixa com alinhamento central + ancora no meio, e a
#      caixa e' simetrica ao eixo do seu container (slide, circulo, coluna).
#      Tags CX/CY guardam o centro esperado.
#   2. A composicao inteira (tudo com tag ROLE) e' recentralizada na
#      vertical no fim de cada layout.
#   3. ANIMACAO FORCADA, ultimo passo: cada forma tem tag FRAME. O slide
#      completo e' desenhado uma vez; depois e' duplicado e, em cada copia,
#      apagam-se as formas de frame maior. O que ja estava fica identico e na
#      mesma posicao. Sem recurso de animacao do PowerPoint.
#
# Imagem nova = placeholder cinza com legenda (o Diego aplica no ensaio).
#
#   node aula4-meio-spec-build.js
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\gerar-aula4-meio.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\qa-deck.ps1
#
# Feche o PowerPoint antes. Fonte so' leitura: e' copiada antes de abrir.
param(
  [string]$Spec  = "$PSScriptRoot\aula4-meio-spec.json",
  [string]$Fonte = "$PSScriptRoot\..\Aula 2 6498 - inicial.pptx",
  [string]$Out   = "$PSScriptRoot\..\Aula 4 6498 - meio episodio D.pptx",
  [string]$Calibracao = "$PSScriptRoot\aula4-meio-calibracao.json",
  [switch]$SemNotas
)
$ErrorActionPreference = 'Stop'
$itens = Get-Content -Raw -Encoding UTF8 $Spec | ConvertFrom-Json

# ---------------------------------------------------------------- tema ----
function Cor([string]$hex) {
  $h = $hex.TrimStart('#')
  return [Convert]::ToInt32($h.Substring(0,2),16) + 256 * [Convert]::ToInt32($h.Substring(2,2),16) + 65536 * [Convert]::ToInt32($h.Substring(4,2),16)
}
$PAL = @{
  azul = Cor '052FD3'; azulClaro = Cor '6F8BFF'; branco = Cor 'FFFFFF'; preto = Cor '000000'
  tinta = Cor '14161B'; cinza = Cor '8A8FA0'; cinzaClaro = Cor 'C9CCD6'; cinzaEsc = Cor '5B6070'
  card = Cor '15171D'; borda = Cor '2C303A'; cardClaro = Cor 'FFFFFF'; bordaClara = Cor 'D9DBE3'
  verde = Cor '2FB36B'; vermelho = Cor 'E5484D'; ambar = Cor 'F2A93B'; bolhaBot = Cor '262A33'
  codigo = Cor '0B0D12'; placeholder = Cor '1E2129'
}
$FONTES = @{ titulo = 'Encode Sans SemiBold'; display = 'Encode Sans'; corpo = 'Roboto'; mono = 'Ubuntu Mono' }
$SLIDE_W = 1920; $SLIDE_H = 1080

# Fundos: slide da fonte + formas que sobrevivem (o resto e' apagado).
$FUNDOS = @{
  'azul'    = @{ slide = 31; manter = @(1, 2, 3, 5) }
  'circulo' = @{ slide = 6;  manter = @(1, 2, 3, 4, 6, 7, 8) }
  'escuro'  = @{ slide = 8;  manter = @(1, 2) }
  'claro'   = @{ slide = 16; manter = @(1, 2, 3, 4, 19) }
  'coluna'  = @{ slide = 37; manter = @(15, 17, 18) }
  'capa'    = @{ slide = 22; manter = @(1, 2, 3) }
}
$FUNDO_DO_LAYOUT = @{
  divisor = 'azul'; circulo = 'circulo'; hero = 'capa'; imagem = 'coluna'
  conversa = 'escuro'; tabela = 'escuro'; ramos = 'escuro'; decisoes = 'escuro'; regua = 'escuro'
  codigo = 'escuro'; contraste = 'escuro'; timeline = 'escuro'; numeros = 'escuro'; ciclo = 'escuro'
  citacao = 'claro'; padrao = 'claro'; caminhos = 'claro'; criterio = 'claro'; lista = 'claro'
}

# ------------------------------------------------------------- helpers ----
$script:frameAtual = 0
function Marcar($s, [string]$role, [int]$frame) {
  $s.Tags.Add('ROLE', $role)
  $s.Tags.Add('FRAME', "$frame")
}

function Formatar($s, [string]$txt, $o) {
  $tf = $s.TextFrame
  $tf.WordWrap = -1
  $tf.AutoSize = 0
  $tf.MarginLeft = [single]$(if ($o.ml -ne $null) { $o.ml } else { 0 }); $tf.MarginRight = [single]$(if ($o.mr -ne $null) { $o.mr } else { 0 })
  $tf.MarginTop = [single]$(if ($o.mt -ne $null) { $o.mt } else { 0 }); $tf.MarginBottom = [single]$(if ($o.mb -ne $null) { $o.mb } else { 0 })
  $tr = $tf.TextRange
  $tr.Text = ($txt -replace "`n", "`r")
  $tr.Font.Name = $(if ($o.font) { $o.font } else { $FONTES.corpo })
  $tr.Font.Size = [single]$(if ($o.size) { $o.size } else { 32 })
  $tr.Font.Color.RGB = $(if ($o.color -ne $null) { $o.color } else { $PAL.branco })
  $tr.Font.Bold = $(if ($o.bold) { -1 } else { 0 })
  $tr.ParagraphFormat.Alignment = $(if ($o.align) { $o.align } else { 2 })
  $tf.VerticalAnchor = $(if ($o.anchor) { $o.anchor } else { 3 })
  if ($o.spacing) { $s.TextFrame2.TextRange.Font.Spacing = [single]$o.spacing }
  # Encolhe ate caber (nunca deixa texto vazar da caixa).
  $min = $(if ($o.min) { $o.min } else { 20 })
  $alturaUtil = $s.Height - $tf.MarginTop - $tf.MarginBottom
  while ($tr.BoundHeight -gt ($alturaUtil + 1) -and $tr.Font.Size -gt $min) { $tr.Font.Size = [single]($tr.Font.Size - 2) }
}

function Texto($sl, [string]$txt, $l, $t, $w, $h, $o = @{}, [string]$role = 'TEXTO', [int]$frame = -1) {
  $s = $sl.Shapes.AddTextbox(1, [single]$l, [single]$t, [single]$w, [single]$h)
  $s.TextFrame.AutoSize = 0
  $s.Height = [single]$h
  Formatar $s $txt $o
  if ($frame -lt 0) { $frame = $script:frameAtual }
  Marcar $s $role $frame
  return $s
}

# Titulo: caixa simetrica ao eixo cx, ancora no meio, texto centralizado.
function Titulo($sl, [string]$txt, $cx, $t, $w, $h, $o = @{}) {
  $oo = @{ font = $FONTES.titulo; size = 64; color = $PAL.branco; align = 2; anchor = 3; min = 36 }
  foreach ($k in $o.Keys) { $oo[$k] = $o[$k] }
  $s = Texto $sl $txt ($cx - $w / 2) $t $w $h $oo 'TITULO' 0
  $s.Tags.Add('CX', "$cx")
  return $s
}

function Caixa($sl, $l, $t, $w, $h, $fill, $line = $null, [double]$raio = 0.12, [int]$tipo = 5, [string]$role = 'FORMA', [int]$frame = -1) {
  $s = $sl.Shapes.AddShape($tipo, [single]$l, [single]$t, [single]$w, [single]$h)
  if ($tipo -eq 5) { $s.Adjustments.Item(1) = [single]$raio }
  if ($fill -eq $null) { $s.Fill.Visible = 0 } else { $s.Fill.Visible = -1; $s.Fill.Solid(); $s.Fill.ForeColor.RGB = $fill }
  if ($line -eq $null) { $s.Line.Visible = 0 } else { $s.Line.Visible = -1; $s.Line.ForeColor.RGB = $line; $s.Line.Weight = 2 }
  $s.Shadow.Visible = 0
  if ($frame -lt 0) { $frame = $script:frameAtual }
  Marcar $s $role $frame
  return $s
}

function CaixaTexto($sl, [string]$txt, $l, $t, $w, $h, $fill, $line, $o = @{}, [double]$raio = 0.12, [int]$tipo = 5) {
  $s = Caixa $sl $l $t $w $h $fill $line $raio $tipo
  $oo = @{ ml = 24; mr = 24; mt = 10; mb = 10 }
  foreach ($k in $o.Keys) { $oo[$k] = $o[$k] }
  Formatar $s $txt $oo
  return $s
}

function Linha($sl, $x1, $y1, $x2, $y2, $cor, $peso = 3, [switch]$Seta, [int]$frame = -1) {
  $s = $sl.Shapes.AddLine([single]$x1, [single]$y1, [single]$x2, [single]$y2)
  $s.Line.ForeColor.RGB = $cor; $s.Line.Weight = [single]$peso
  if ($Seta) { $s.Line.EndArrowheadStyle = 2 }
  if ($frame -lt 0) { $frame = $script:frameAtual }
  Marcar $s 'FORMA' $frame
  return $s
}

function CorTipo([string]$tipo) {
  switch ($tipo) { 'ok' { $PAL.verde } 'alerta' { $PAL.ambar } 'erro' { $PAL.vermelho } default { $PAL.cinza } }
}
function IconeTipo([string]$tipo) {
  switch ($tipo) { 'ok' { [string][char]0x2713 } 'alerta' { '!' } 'erro' { [string][char]0x2715 } default { [string][char]0x2192 } }
}
function Selo($sl, [string]$tipo, $cx, $cy, $d = 64) {
  $s = CaixaTexto $sl (IconeTipo $tipo) ($cx - $d / 2) ($cy - $d / 2) $d $d (CorTipo $tipo) $null @{ font = 'Segoe UI Symbol'; size = [int]($d * 0.5); bold = $true; color = $PAL.branco; ml = 0; mr = 0; mt = 0; mb = 0 } 0 9
  return $s
}

# Calibracao optica em duas passadas: a tinta das letras nao fica no centro
# da caixa de linha (acento, descendente e numero de linhas mudam isso). O
# qa-deck.ps1 mede o desvio real de cada titulo no PNG e grava
# aula4-meio-calibracao.json (ITEM -> dy em pt); aqui o titulo sobe/desce
# exatamente isso. Sem o arquivo, sai sem correcao e o QA aponta.
$CALIB = @{}
if (Test-Path $Calibracao) {
  $cj = Get-Content -Raw -Encoding UTF8 $Calibracao | ConvertFrom-Json
  foreach ($p in $cj.PSObject.Properties) { $CALIB[$p.Name] = [double]$p.Value }
}
function Calibrar-Titulo($s, [int]$item) {
  if ($s.Tags.Item('CY') -eq '') { $s.Tags.Add('CY', ('{0:F1}' -f ($s.Top + $s.Height / 2)).Replace(',', '.')) }
  $dy = $(if ($CALIB.ContainsKey("$item")) { $CALIB["$item"] } else { 0 })
  $s.Tags.Add('CAL', ('{0:F1}' -f $dy).Replace(',', '.'))
  $s.Top = [single]($s.Top - $dy)
}

# Ajusta a composicao (tudo com ROLE, menos placeholder e veu): escala ate
# preencher a area segura (aw x ah, centro cx,cy) e centraliza H e V. Fontes
# e espessuras escalam junto, entao a quebra de linha nao muda. Titulos sao
# recolocados no proprio eixo (tag CX) depois da escala.
function Centralizar-Composicao($sl, $cx = 960, $cy = 540, $aw = 1680, $ah = 900) {
  $top = 1e9; $bot = -1e9; $esq = 1e9; $dir = -1e9; $formas = @()
  foreach ($s in $sl.Shapes) {
    $r = $s.Tags.Item('ROLE')
    if ($r -eq '' -or $r -eq 'IMAGEM' -or $r -eq 'VEU') { continue }
    $formas += $s
    $t = $s.Top; $b = $s.Top + $s.Height; $l = $s.Left; $rr = $s.Left + $s.Width
    if ($s.HasTextFrame -and $s.TextFrame.HasText -and $s.Type -eq 17) {
      # caixa de texto pura: mede pelo texto, nao pela caixa
      $tr = $s.TextFrame.TextRange
      $t = $tr.BoundTop; $b = $tr.BoundTop + $tr.BoundHeight; $l = $tr.BoundLeft; $rr = $tr.BoundLeft + $tr.BoundWidth
    }
    if ($t -lt $top) { $top = $t }; if ($b -gt $bot) { $bot = $b }
    if ($l -lt $esq) { $esq = $l }; if ($rr -gt $dir) { $dir = $rr }
  }
  if (-not $formas.Count) { return }
  $f = [Math]::Min($aw / ($dir - $esq), $ah / ($bot - $top))
  $f = [Math]::Max(0.7, [Math]::Min(1.8, $f))
  $bx = ($esq + $dir) / 2; $by = ($top + $bot) / 2
  foreach ($s in $formas) {
    if ($s.HasTextFrame) {
      $tf = $s.TextFrame
      $tf.AutoSize = 0
      if ($tf.HasText) { $tf.TextRange.Font.Size = [single]($tf.TextRange.Font.Size * $f) }
      $tf.MarginLeft = [single]($tf.MarginLeft * $f); $tf.MarginRight = [single]($tf.MarginRight * $f)
      $tf.MarginTop = [single]($tf.MarginTop * $f); $tf.MarginBottom = [single]($tf.MarginBottom * $f)
    }
    if ($s.Type -ne 17 -and $s.Line.Visible) { $s.Line.Weight = [single]($s.Line.Weight * $f) }
    if ($s.Type -eq 9) {
      # linha/conector: reposiciona pelas pontas
      $s.Left = [single]($cx + ($s.Left - $bx) * $f); $s.Top = [single]($cy + ($s.Top - $by) * $f)
      $s.Width = [single]($s.Width * $f); $s.Height = [single]($s.Height * $f)
      continue
    }
    $nl = $cx + ($s.Left - $bx) * $f; $nt = $cy + ($s.Top - $by) * $f
    $s.Width = [single]($s.Width * $f); $s.Height = [single]($s.Height * $f)
    $s.Left = [single]$nl; $s.Top = [single]$nt
  }
  foreach ($s in $formas) {
    if ($s.Tags.Item('ROLE') -eq 'TITULO') { $s.Left = [single]([double]$s.Tags.Item('CX') - $s.Width / 2) }
  }
}

# ----------------------------------------------------------- layouts ------
function L-divisor($sl, $it) {
  # "4.2.1 O hamburguer que sumiu" -> numero numa linha, titulo na outra (sem viuva)
  $txt = $it.title -replace '^(\d+(\.\d+)*)\s+', "`$1`n"
  $t = Titulo $sl $txt 960 290 1640 500 @{ font = $FONTES.display; size = 112; min = 80 }
  $t.Tags.Add('CY', '540')
}

function L-circulo($sl, $it) {
  # circulo da base: centro (960,540), raio ~716
  $t = Titulo $sl $it.title 960 250 900 580 @{ font = $FONTES.display; size = 120; min = 72 }
  $t.Tags.Add('CY', '540')
}

function L-hero($sl, $it) {
  $esfera = $sl.Shapes.Item(2)
  $esfera.Left = [single](($SLIDE_W - $esfera.Width) / 2 + 260)
  $veu = Caixa $sl 0 0 $SLIDE_W $SLIDE_H $PAL.preto $null 0 1 'VEU' 0
  $veu.Fill.Transparency = [single]0.45
  $t = Titulo $sl $it.title 960 300 1500 220 @{ font = $FONTES.titulo; size = 120; min = 80 }
  Texto $sl $it.sub 210 540 1500 100 @{ font = $FONTES.display; size = 60; color = $PAL.branco } | Out-Null
  Texto $sl $it.meta.ToUpper() 210 700 1500 60 @{ font = $FONTES.display; size = 30; color = $PAL.cinzaClaro; spacing = 3 } | Out-Null
  Centralizar-Composicao $sl
}

function L-conversa($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 | Out-Null
  # Convencao de chat: azul a direita = Diego, cinza a esquerda = o produto.
  $n = @($it.msgs).Count
  $fonte = $(if ($n -gt 3) { 27 } else { 34 }); $gap = $(if ($n -gt 3) { 22 } else { 40 })
  $y = 150; $k = 0
  foreach ($m in $it.msgs) {
    $k++; $script:frameAtual = $k
    $diego = ($m.who -eq 'diego')
    $larg = 900
    $fill = $(if ($diego) { $PAL.azul } else { $PAL.bolhaBot })
    $l = $(if ($diego) { 960 + 560 - $larg } else { 960 - 560 })
    $b = Caixa $sl $l $y $larg 60 $fill $null 0.3
    Formatar $b $m.text @{ size = $fonte; align = 1; anchor = 3; ml = 30; mr = 30; mt = 14; mb = 14; min = $fonte }
    $b.TextFrame.AutoSize = 1
    $b.Left = [single]$l; $b.Top = [single]$y
    $y = $b.Top + $b.Height + $gap
  }
  $script:frameAtual = $k + 1
  Texto $sl $it.caption 260 ($y + 10) 1400 70 @{ font = $FONTES.display; size = 36; color = $PAL.ambar } | Out-Null
  Centralizar-Composicao $sl
}

function L-tabela($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 | Out-Null
  Texto $sl $it.sub 260 110 1400 50 @{ size = 32; color = $PAL.cinza } | Out-Null
  $larg = 0; foreach ($cw in $it.colW) { $larg += $cw }
  $l0 = 960 - $larg / 2; $y = 200
  $x = $l0; $i = 0
  foreach ($hd in $it.header) {
    Texto $sl $hd.ToUpper() ($x + 24) $y ($it.colW[$i] - 48) 56 @{ font = $FONTES.display; size = 26; color = $PAL.azulClaro; align = 1; spacing = 2 } | Out-Null
    $x += $it.colW[$i]; $i++
  }
  $y += 64; $r = 0
  foreach ($row in $it.rows) {
    $r++; $script:frameAtual = $r
    Caixa $sl $l0 $y $larg 104 $PAL.card $PAL.borda 0.1 | Out-Null
    $x = $l0; $i = 0
    foreach ($cell in $row) {
      $o = @{ size = 36; align = 1; color = $PAL.branco; min = 28 }
      if ($i -eq 0) { $o = @{ font = $FONTES.titulo; size = 36; color = $PAL.azulClaro; align = 2 } }
      if ($i -eq 2) { $o.color = $PAL.verde }
      if ($i -eq 3) { $o.color = $PAL.cinzaClaro }
      Texto $sl $cell ($x + 24) ($y + 8) ($it.colW[$i] - 48) 88 $o | Out-Null
      $x += $it.colW[$i]; $i++
    }
    $y += 120
  }
  Centralizar-Composicao $sl
}

function L-cards3($sl, $it) {
  $claro = ($it.bg -eq 'claro')
  $corTit = $(if ($claro) { $PAL.tinta } else { $PAL.branco })
  Titulo $sl $it.title 960 0 1600 110 @{ color = $corTit } | Out-Null
  $wc = 500; $gap = 50; $hc = 500; $l0 = 960 - (3 * $wc + 2 * $gap) / 2; $y = 170; $k = 0
  foreach ($c in $it.cards) {
    $k++; $script:frameAtual = $k
    $x = $l0 + ($k - 1) * ($wc + $gap)
    Caixa $sl $x $y $wc $hc $(if ($claro) { $PAL.cardClaro } else { $PAL.card }) $(if ($claro) { $PAL.bordaClara } else { $PAL.borda }) 0.06 | Out-Null
    Caixa $sl $x $y $wc 10 $PAL.azul $null 0 1 | Out-Null
    Texto $sl $c.tag ($x + 40) ($y + 50) ($wc - 80) 40 @{ font = $FONTES.display; size = 28; color = $(if ($claro) { $PAL.azul } else { $PAL.azulClaro }); bold = $true; spacing = 3 } | Out-Null
    $corHead = $(if ($claro) { $PAL.verde } else { $corTit })
    Texto $sl $c.head ($x + 36) ($y + 110) ($wc - 72) 130 @{ font = $FONTES.titulo; size = 50; color = $corHead; min = 36 } | Out-Null
    Texto $sl $c.body ($x + 36) ($y + 250) ($wc - 72) 170 @{ size = 34; color = $(if ($claro) { $PAL.cinzaEsc } else { $PAL.cinzaClaro }); min = 28 } | Out-Null
    if ($c.foot) { Texto $sl $c.foot ($x + 36) ($y + $hc - 66) ($wc - 72) 44 @{ size = 28; color = $PAL.cinza; min = 24 } | Out-Null }
  }
  if ($it.sub) {
    $script:frameAtual = $k + 1
    Texto $sl $it.sub 210 ($y + $hc + 50) 1500 70 @{ font = $FONTES.display; size = 38; color = $(if ($claro) { $PAL.azul } else { $PAL.ambar }) } | Out-Null
  }
  Centralizar-Composicao $sl
}

function L-imagem($sl, $it) {
  # coluna de texto 160..1100 (eixo 630) + placeholder a direita
  $ph = Caixa $sl 1180 0 740 $SLIDE_H $PAL.placeholder $PAL.cinzaEsc 0 1 'IMAGEM' 0
  $ph.Line.DashStyle = 4
  $leg = Texto $sl $it.placeholder 1240 470 620 140 @{ font = $FONTES.display; size = 32; color = $PAL.cinza } 'IMAGEM' 0
  Titulo $sl $it.title 630 0 880 220 @{ font = $FONTES.display; size = 88; min = 60 } | Out-Null
  $y = 260; $k = 0
  foreach ($b in $it.bullets) {
    $k++; $script:frameAtual = $k
    Caixa $sl 190 ($y + 22) 22 22 $PAL.azul $null 0 1 | Out-Null
    Texto $sl $b 240 $y 820 130 @{ size = 42; align = 1; anchor = 1; min = 32 } | Out-Null
    $y += 170
  }
  Centralizar-Composicao $sl 630 540 860 880
}

function L-ramos($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 | Out-Null
  CaixaTexto $sl $it.raiz 660 170 600 120 $PAL.azul $null @{ font = $FONTES.titulo; size = 40 } 0.5 | Out-Null
  $k = 0; $centros = @(560, 1360)
  foreach ($r in $it.ramos) {
    $cx = $centros[$k]; $k++; $script:frameAtual = $k
    $cor = CorTipo $r.tipo
    Linha $sl 960 290 $cx 420 $cor 4 -Seta | Out-Null
    Caixa $sl ($cx - 340) 430 680 300 $PAL.card $cor 0.08 | Out-Null
    Selo $sl $r.tipo $cx 490 | Out-Null
    Texto $sl $r.head ($cx - 300) 540 600 70 @{ font = $FONTES.titulo; size = 44; color = $cor } | Out-Null
    Texto $sl $r.body ($cx - 300) 615 600 100 @{ size = 32; color = $PAL.cinzaClaro; min = 26 } | Out-Null
  }
  $script:frameAtual = $k + 1
  Texto $sl $it.nota 260 780 1400 60 @{ font = $FONTES.display; size = 34; color = $PAL.ambar } | Out-Null
  Centralizar-Composicao $sl
}

function L-citacao($sl, $it) {
  Titulo $sl $it.title 960 0 1600 90 @{ color = $PAL.azul; size = 40 } | Out-Null
  Texto $sl ([string][char]0x201C) 860 90 200 160 @{ font = $FONTES.titulo; size = 200; color = $PAL.azul } | Out-Null
  Texto $sl $it.quote 260 250 1400 330 @{ font = $FONTES.display; size = 56; color = $PAL.tinta; min = 40 } | Out-Null
  $script:frameAtual = 1
  CaixaTexto $sl $it.fonte 610 620 700 90 $PAL.azul $null @{ font = $FONTES.titulo; size = 34; color = $PAL.branco } 0.5 | Out-Null
  Centralizar-Composicao $sl
}

function L-decisoes($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 | Out-Null
  $y = 170; $k = 0
  foreach ($r in $it.rows) {
    $script:frameAtual = 0
    CaixaTexto $sl $r.q 220 $y 560 120 $PAL.card $PAL.borda @{ font = $FONTES.titulo; size = 36; align = 3; mr = 40 } 0.1 | Out-Null
    $vazio = Caixa $sl 820 $y 880 120 $null $PAL.cinzaEsc 0.1
    $vazio.Line.DashStyle = 4
    Texto $sl '?' 820 $y 880 120 @{ font = $FONTES.display; size = 56; color = $PAL.cinzaEsc } | Out-Null
    $k++; $script:frameAtual = $k
    $cor = $(if ($r.destaque) { $PAL.ambar } else { $PAL.azul })
    $o = @{ size = 38; color = $PAL.branco; align = 1; ml = 44 }
    if ($r.mono) { $o.font = $FONTES.mono; $o.size = 44 }
    CaixaTexto $sl $r.a 820 $y 880 120 $PAL.tinta $cor $o 0.1 | Out-Null
    $y += 150
  }
  Centralizar-Composicao $sl
}

function L-regua($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 | Out-Null
  $x0 = 260; $x1 = 1660; $y = 400
  Linha $sl $x0 $y $x1 $y $PAL.cinzaEsc 6 | Out-Null
  # frames: 1 = a marca escolhida (20 min), 2 e 3 = as outras, na ordem; 4 e 5 = os dois riscos
  $pos = @(0.12, 0.4, 0.92); $k = 0; $outra = 2
  foreach ($m in $it.marcas) {
    $cx = $x0 + ($x1 - $x0) * $pos[$k]
    if ($m.destaque) { $script:frameAtual = 1 } else { $script:frameAtual = $outra; $outra++ }
    $d = $(if ($m.destaque) { 56 } else { 36 })
    $cor = $(if ($m.destaque) { $PAL.azul } else { $PAL.cinza })
    $dot = Caixa $sl ($cx - $d / 2) ($y - $d / 2) $d $d $cor $(if ($m.destaque) { $PAL.branco } else { $null }) 0 9
    Texto $sl $m.v ($cx - 200) ($y - 170) 400 100 @{ font = $FONTES.titulo; size = $(if ($m.destaque) { 80 } else { 56 }); color = $(if ($m.destaque) { $PAL.branco } else { $PAL.cinzaClaro }) } | Out-Null
    Texto $sl $m.label ($cx - 200) ($y + 50) 400 50 @{ size = 32; color = $PAL.cinza } | Out-Null
    $k++
  }
  $script:frameAtual = 4
  CaixaTexto $sl $it.esquerda 260 560 680 190 $PAL.card $PAL.borda @{ size = 34; color = $PAL.cinzaClaro } 0.1 | Out-Null
  $script:frameAtual = 5
  CaixaTexto $sl $it.direita 980 560 680 190 $PAL.card $PAL.vermelho @{ size = 34; color = $PAL.branco } 0.1 | Out-Null
  Centralizar-Composicao $sl
}

function L-codigo($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 | Out-Null
  Texto $sl $it.sub 260 110 1400 50 @{ size = 32; color = $PAL.cinza } | Out-Null
  $blocos = @(); $atual = @()
  foreach ($ln in $it.code) { if ($ln -eq '') { $blocos += ,@($atual); $atual = @() } else { $atual += $ln } }
  $blocos += ,@($atual)
  $alturaLinha = 52
  $total = 0; foreach ($b in $blocos) { $total += $b.Count * $alturaLinha }
  $hPainel = 90 + $total + ($blocos.Count - 1) * 40 + 50
  Caixa $sl 210 190 1500 $hPainel $PAL.codigo $PAL.borda 0.03 | Out-Null
  $i = 0; foreach ($cc in @('E5484D', 'F2A93B', '2FB36B')) { Caixa $sl (250 + $i * 36) 222 18 18 (Cor $cc) $null 0 9 | Out-Null; $i++ }
  $y = 280; $k = 0
  foreach ($b in $blocos) {
    $k++; $script:frameAtual = $k
    $h = $b.Count * $alturaLinha
    Texto $sl ($b -join "`n") 270 $y 1380 $h @{ font = $FONTES.mono; size = 40; color = $PAL.cinzaClaro; align = 1; anchor = 1; min = 30 } | Out-Null
    $y += $h + 40
  }
  Centralizar-Composicao $sl
}

function L-padrao($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 @{ color = $PAL.tinta } | Out-Null
  $blocos = @(@{ d = $it.de; l = 200; cor = $PAL.cinzaEsc }, @{ d = $it.para; l = 1060; cor = $PAL.azul })
  $k = 0
  foreach ($b in $blocos) {
    $script:frameAtual = $k + 1
    Caixa $sl $b.l 180 660 240 $PAL.cardClaro $b.cor 0.08 | Out-Null
    Texto $sl $b.d.head ($b.l + 30) 220 600 80 @{ font = $FONTES.mono; size = 46; color = $b.cor; min = 34 } | Out-Null
    Texto $sl $b.d.sub ($b.l + 30) 305 600 70 @{ size = 32; color = $PAL.cinzaEsc; min = 26 } | Out-Null
    if ($k -eq 1) { Caixa $sl 890 260 140 80 $PAL.azul $null 0.5 33 | Out-Null }
    $k++
  }
  $script:frameAtual = 3
  Texto $sl 'MESMO MOLDE' 260 475 1400 44 @{ font = $FONTES.display; size = 28; color = $PAL.cinza; spacing = 3 } | Out-Null
  $wp = 440; $gap = 90; $l0 = 960 - (3 * $wp + 2 * $gap) / 2; $i = 0
  foreach ($p in $it.passos) {
    $x = $l0 + $i * ($wp + $gap)
    CaixaTexto $sl $p $x 540 $wp 110 $PAL.tinta $null @{ font = $FONTES.titulo; size = 34 } 0.5 | Out-Null
    if ($i -lt 2) { Linha $sl ($x + $wp + 14) 595 ($x + $wp + $gap - 14) 595 $PAL.azul 4 -Seta | Out-Null }
    $i++
  }
  Centralizar-Composicao $sl
}

function L-contraste($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 | Out-Null
  $k = 0
  foreach ($lado in @($it.esq, $it.dir)) {
    $k++; $script:frameAtual = $k
    $x = $(if ($k -eq 1) { 200 } else { 1000 }); $cor = CorTipo $lado.tipo
    Caixa $sl $x 170 720 500 $PAL.card $cor 0.06 | Out-Null
    Selo $sl $lado.tipo ($x + 360) 250 72 | Out-Null
    Texto $sl $lado.tag ($x + 40) 310 640 50 @{ font = $FONTES.display; size = 28; color = $cor; bold = $true; spacing = 4 } | Out-Null
    Texto $sl $lado.head ($x + 40) 370 640 80 @{ font = $FONTES.mono; size = 48; color = $PAL.branco } | Out-Null
    Texto $sl $lado.body ($x + 40) 465 640 190 @{ size = 34; color = $PAL.cinzaClaro; min = 28 } | Out-Null
  }
  Centralizar-Composicao $sl
}

function L-caminhos($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 @{ color = $PAL.tinta } | Out-Null
  $k = 0
  foreach ($col in $it.cols) {
    $k++; $script:frameAtual = $k
    $x = $(if ($k -eq 1) { 200 } else { 1000 }); $cor = CorTipo $col.tipo; $cx = $x + 360
    Caixa $sl $x 170 720 700 $PAL.cardClaro $PAL.bordaClara 0.05 | Out-Null
    Caixa $sl $x 170 720 12 $cor $null 0 1 | Out-Null
    Texto $sl $col.head ($x + 40) 210 640 80 @{ font = $FONTES.titulo; size = 46; color = $PAL.tinta } | Out-Null
    $y = 310; $i = 0
    foreach ($p in $col.passos) {
      $i++
      CaixaTexto $sl $p ($x + 50) $y 620 96 (Cor 'EEF0F5') $null @{ size = 34; color = $PAL.tinta; min = 28 } 0.2 | Out-Null
      if ($i -lt $col.passos.Count) { Linha $sl $cx ($y + 94) $cx ($y + 126) $PAL.cinza 3 -Seta | Out-Null }
      $y += 130
    }
    CaixaTexto $sl $col.resultado ($x + 50) ($y + 10) 620 96 $cor $null @{ font = $FONTES.titulo; size = 34; color = $PAL.branco; min = 28 } 0.5 | Out-Null
  }
  Centralizar-Composicao $sl
}

function L-timeline($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 | Out-Null
  $wb = 330; $gap = 60; $l0 = 960 - (4 * $wb + 3 * $gap) / 2; $y = 200; $k = 0
  $xs = @()
  foreach ($t in $it.traces) {
    $k++; $script:frameAtual = $k
    $x = $l0 + ($k - 1) * ($wb + $gap); $xs += $x
    Caixa $sl $x $y $wb 260 $PAL.card $PAL.borda 0.08 | Out-Null
    Texto $sl "TRACE $($t.n)" ($x + 20) ($y + 32) ($wb - 40) 44 @{ font = $FONTES.display; size = 28; color = $PAL.cinza; spacing = 3 } | Out-Null
    Texto $sl $t.txt ($x + 20) ($y + 90) ($wb - 40) 70 @{ font = $FONTES.titulo; size = 38; color = $PAL.branco; min = 28 } | Out-Null
    Selo $sl 'ok' ($x + $wb / 2) ($y + 200) 56 | Out-Null
    if ($k -lt 4) { Linha $sl ($x + $wb + 8) ($y + 130) ($x + $wb + $gap - 8) ($y + 130) $PAL.cinzaEsc 3 -Seta | Out-Null }
  }
  $script:frameAtual = $k + 1
  $a = $xs[$it.chave.de] + 40; $b = $xs[$it.chave.ate] + $wb - 40; $yb = $y + 300
  Linha $sl $a $yb $b $yb $PAL.ambar 5 | Out-Null
  Linha $sl $a ($yb - 24) $a $yb $PAL.ambar 5 | Out-Null
  Linha $sl $b ($yb - 24) $b $yb $PAL.ambar 5 | Out-Null
  Texto $sl $it.chave.label 460 ($yb + 24) 1000 70 @{ font = $FONTES.display; size = 38; color = $PAL.ambar } | Out-Null
  Centralizar-Composicao $sl
}

function L-criterio($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 @{ font = $FONTES.mono; size = 64; color = $PAL.tinta } | Out-Null
  Texto $sl $it.sub 260 110 1400 60 @{ size = 32; color = $PAL.cinzaEsc } | Out-Null
  $y = 220; $k = 0
  foreach ($s in $it.saidas) {
    $k++; $script:frameAtual = $k
    $cor = CorTipo $s.tipo
    CaixaTexto $sl $s.cond 300 $y 900 120 $PAL.cardClaro $PAL.bordaClara @{ size = 36; color = $PAL.tinta; align = 1; ml = 44 } 0.15 | Out-Null
    Linha $sl 1220 ($y + 60) 1360 ($y + 60) $PAL.cinza 4 -Seta | Out-Null
    CaixaTexto $sl $s.val 1380 $y 240 120 $cor $null @{ font = $FONTES.titulo; size = 52; color = $PAL.branco } 0.5 | Out-Null
    $y += 160
  }
  Centralizar-Composicao $sl
}

function L-numeros($sl, $it) {
  Titulo $sl $it.title 960 0 1600 110 | Out-Null
  $wp = 480; $gap = 60; $l0 = 960 - (3 * $wp + 2 * $gap) / 2; $k = 0
  foreach ($p in $it.paineis) {
    $k++; $script:frameAtual = $k
    $x = $l0 + ($k - 1) * ($wp + $gap); $cor = CorTipo $p.tipo
    Caixa $sl $x 170 $wp 600 $PAL.card $PAL.borda 0.06 | Out-Null
    Texto $sl $p.quando ($x + 30) 205 ($wp - 60) 44 @{ font = $FONTES.display; size = 28; color = $PAL.cinza; spacing = 3 } | Out-Null
    Texto $sl $p.prato ($x + 30) 260 ($wp - 60) 70 @{ font = $FONTES.titulo; size = 38; color = $PAL.branco; min = 28 } | Out-Null
    Texto $sl $p.val ($x + 30) 340 ($wp - 60) 260 @{ font = $FONTES.titulo; size = 220; color = $cor; min = 160 } | Out-Null
    Texto $sl $p.nota ($x + 30) 630 ($wp - 60) 110 @{ size = 32; color = $PAL.cinzaClaro; min = 26 } | Out-Null
  }
  Centralizar-Composicao $sl
}

function L-ciclo($sl, $it) {
  Titulo $sl $it.title 960 0 1600 130 @{ size = 84 } | Out-Null
  $n = $it.passos.Count; $wc = 420; $passo = 380; $l0 = 960 - (($n - 1) * $passo + $wc) / 2; $k = 0
  foreach ($p in $it.passos) {
    $k++; $script:frameAtual = $k
    $ult = ($k -eq $n)
    $s = CaixaTexto $sl $p ($l0 + ($k - 1) * $passo) 300 $wc 260 $(if ($ult) { $PAL.branco } else { $PAL.azul }) $PAL.preto @{ font = $FONTES.titulo; size = 50; color = $(if ($ult) { $PAL.azul } else { $PAL.branco }); ml = 70; mr = 30; min = 40 } 0 52
    $s.TextFrame.WordWrap = 0
    $s.Line.Weight = 6
  }
  Centralizar-Composicao $sl
}

function L-lista($sl, $it) {
  Titulo $sl $it.title 960 0 1600 130 @{ color = $PAL.tinta } | Out-Null
  $y = 210; $k = 0
  foreach ($i in $it.itens) {
    $k++; $script:frameAtual = $k
    CaixaTexto $sl "$k" 300 $y 110 110 $PAL.azul $null @{ font = $FONTES.titulo; size = 52; color = $PAL.branco; ml = 0; mr = 0 } 0 9 | Out-Null
    Texto $sl $i.head 460 ($y - 8) 1160 70 @{ font = $FONTES.titulo; size = 50; color = $PAL.tinta; align = 1; min = 34 } | Out-Null
    Texto $sl $i.body 460 ($y + 64) 1160 60 @{ size = 38; color = $PAL.cinzaEsc; align = 1; min = 30 } | Out-Null
    $y += 190
  }
  Centralizar-Composicao $sl
}

# -------------------------------------------------------------- deck ------
$app = New-Object -ComObject PowerPoint.Application
$app.DisplayAlerts = 1
Copy-Item -Force $Fonte $Out
$pres = $app.Presentations.Open($Out, $false, $false, $false)
$nOrig = $pres.Slides.Count

function Novo-Fundo([string]$nome) {
  $f = $FUNDOS[$nome]
  $dup = $pres.Slides.Item($f.slide).Duplicate()
  $dup.MoveTo($pres.Slides.Count)
  $sl = $pres.Slides.Item($pres.Slides.Count)
  $sl.SlideShowTransition.Hidden = 0   # achado 16/09: Duplicate() pode herdar slide oculto
  $apagar = @()
  for ($i = 1; $i -le $sl.Shapes.Count; $i++) { if ($f.manter -notcontains $i) { $apagar += $sl.Shapes.Item($i) } }
  foreach ($s in $apagar) { $s.Delete() }
  return $sl
}

function Notas($sl, [string]$txt) {
  if ($SemNotas -or -not $txt) { return }
  foreach ($ns in $sl.NotesPage.Shapes) {
    if ($ns.Type -eq 14 -and $ns.PlaceholderFormat.Type -eq 2) { $ns.TextFrame.TextRange.Text = ($txt -replace "`n", "`r"); return }
  }
  Write-Warning "sem placeholder de notas"
}

$gerados = 0; $frames = 0
foreach ($it in $itens) {
  $fundo = $(if ($it.layout -eq 'cards3') { $it.bg } else { $FUNDO_DO_LAYOUT[$it.layout] })
  if (-not $fundo) { Write-Warning "$($it.video) #$($it.n): layout desconhecido '$($it.layout)'"; continue }
  $sl = Novo-Fundo $fundo
  $script:frameAtual = 0
  & "L-$($it.layout)" $sl $it
  foreach ($s in @($sl.Shapes)) { if ($s.Tags.Item('ROLE') -eq 'TITULO') { Calibrar-Titulo $s $it.n } }
  $sl.Tags.Add('VIDEO', $it.video); $sl.Tags.Add('ITEM', "$($it.n)"); $sl.Tags.Add('LAYOUT', $it.layout)
  $gerados++

  # ---- ANIMACAO FORCADA (ultimo passo) ----
  $maxK = 0
  foreach ($s in $sl.Shapes) { $fr = $s.Tags.Item('FRAME'); if ($fr -ne '' -and [int]$fr -gt $maxK) { $maxK = [int]$fr } }
  $inicio = $(if ($it.buildInicio -ne $null) { [int]$it.buildInicio } else { 1 })
  $totalFrames = [Math]::Max(1, $maxK - $inicio + 1)
  $sl.Tags.Add('BUILD', "$totalFrames/$totalFrames")
  for ($k = $inicio; $k -lt $maxK; $k++) {
    $dup = $sl.Duplicate()
    $dup.MoveTo($sl.SlideIndex)
    $d = $pres.Slides.Item($sl.SlideIndex - 1)
    $apagar = @()
    foreach ($s in $d.Shapes) { $fr = $s.Tags.Item('FRAME'); if ($fr -ne '' -and [int]$fr -gt $k) { $apagar += $s } }
    foreach ($s in $apagar) { $s.Delete() }
    $d.Tags.Add('BUILD', "$($k - $inicio + 1)/$totalFrames")
    if ($k -eq $inicio) { Notas $d $it.notes } else { Notas $d "(animação forçada $($k - $inicio + 1)/$totalFrames — notas no primeiro frame)" }
    $frames++
  }
  if ($maxK -le $inicio) { Notas $sl $it.notes } else { Notas $sl "(animação forçada $totalFrames/$totalFrames — notas no primeiro frame)" }
  $frames++
}

for ($i = $nOrig; $i -ge 1; $i--) { $pres.Slides.Item($i).Delete() }
$pres.Save()
$total = $pres.Slides.Count
$pres.Close()
$app.Quit()
Write-Host "OK: $gerados slides de conteudo, $total no arquivo (com animacao forcada) -> $Out"
