# Gera o deck inicial da Aula 2.5 (bonus: evals do zero, ao vivo) reaproveitando
# slides JA FINALIZADOS de "Aula 2 6498 - inicial.pptx" como base de design —
# os templates originais (Aula 1 6498.pptx / Aula 2 6498.pptx) nao existem
# nesta maquina e nunca foram versionados no repo (confirmado em 16/09).
#
# So LEITURA no arquivo fonte: ele e' copiado pra um arquivo novo antes de
# qualquer edicao, o original nunca e' aberto em modo escrita.
#
#   powershell -File gerar-aula2.5.ps1
#
# Feche o PowerPoint antes de rodar.
param(
  [string]$Fonte = "$PSScriptRoot\..\Aula 2 6498 - inicial.pptx",
  [string]$Out   = "$PSScriptRoot\..\Aula 2.5 - Evals do zero - inicial.pptx"
)
$ErrorActionPreference = 'Stop'

# Bases identificadas em "Aula 2 6498 - inicial.pptx" (16/09) — mesmos indices
# de forma do BASES original de gerar-aula2.ps1, porque estes slides SAO
# duplicatas-com-texto das bases A1·22/A1·10/A1·16/A1·27 (duplicar preserva a
# ordem das formas).
$BASES = @{
  'divisor'   = @{ slide = 31; title = 4 }
  'statement' = @{ slide = 6;  title = 5 }
  'lista'     = @{ slide = 37; title = 2; items = @(7, 11, 14); hide = @{ 2 = @(8, 9, 10, 11); 3 = @(12, 13, 14) } }
  'build'     = @{ slide = 5;  title = 2; sub = 17; items = @(7, 11, 19); hide = @{ 2 = @(8, 9, 10, 11); 3 = @(12, 18, 19) } }
}

$itens = @(
  @{ n=1;  base='divisor';   title='2.5 Evals do zero, ao vivo'; notes='AÇÃO: nenhuma — só fala de câmera sobre o slide.

Rapidão antes de começar. Na Aula 2 a gente viu: eval não é teste, critério tem quatro partes, o juiz usa tool_choice forçado. Hoje sem mais teoria — vou abrir o chat do Claude, ao vivo, sem nada preparado, e construir um conjunto de eval do zero pra uma parte do produto que eu nunca avaliei.' }

  @{ n=2;  base='statement'; title='Eval não é teste. Critério tem 4 partes.'; notes='O passo a passo é sempre o mesmo: operação e promessa; as três perguntas do slide 34 (promessa, verossimilhança, papel); proponho com o Claude; bato contra o que já vivi; fecho num documento único; implemento o juiz; rodo contra trace real; PR simulado.

Escolhi a receita premium porque ela nunca passou por isso.' }

  @{ n=3;  base='lista'; title='O caminho de hoje';
     bullets=@(
       'Propor: pedir critérios ao Claude, com contexto e regra de ouro',
       'Debater: bater a proposta contra o que a casa já viveu',
       'Fechar: documento único, juiz implementado, PR simulado'
     );
     notes='COMANDO (chat do Claude — colar e enviar, tela cheia, fonte grande):

Contexto: `receita-premium.js` sugere UMA receita por semana, escolhida por um modelo (tool_choice forçado) a partir do feed real de vídeos de um canal do YouTube, cruzando com estoque e preferências da casa. A URL escolhida tem que existir de fato no feed — se não existir, é erro, não silêncio.

Regra de ouro do projeto: a LLM nunca faz aritmética nem decide sozinha coisa que devia ser determinística; código apura fato, o modelo julga só o que não é apurável.

Proponha um conjunto de critérios de eval para esta operação, em linguagem de produto. Cada critério precisa ter: nome, pergunta, escala (binário ou 0–1) e "se falhar, o que acontece". Use as três perguntas como guia: promessa, verossimilhança, papel.

AÇÃO: deixe a resposta terminar de streamar. Leia em voz alta pelo menos um critério inteiro.' }

  @{ n=4;  base='build'; title='O prompt'; sub='Contexto real, regra e as 3 perguntas';
     bullets=@(
       'Contexto: a promessa da operação',
       'Regra de ouro: LLM não decide sozinha',
       'Três perguntas: promessa, risco, papel'
     );
     notes='Se ele sugerir algo sobre "a URL é real" — já existe em código, é guarda-corpo, não eval. Corto isso.

Se ele NÃO sugerir nada sobre repetir receita entre semanas (cenário mais provável): "Interessante — ele não sugeriu nada sobre repetir receita de uma semana pra outra. Isso só aparece quando você olha o dado real, não a spec. Guardo essa pergunta pro próximo passo."' }

  @{ n=5;  base='statement'; tabela=$true; title='Duas semanas. Mesmo vídeo.'; sub='premium_suggestions, consultado agora';
     table=@(
       @('Semana','Vídeo escolhido'),
       @('17/08','Picanha na frigideira'),
       @('24/08','Beef Wellington'),
       @('31/08','Beef Wellington'),
       @('07/09','Polenta cremosa')
     );
     notes='COMANDO (terminal, ao vivo):

node -e "require(''dotenv'').config(); const {createClient}=require(''@supabase/supabase-js''); const s=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY); s.from(''premium_suggestions'').select(''week_start,video_title'').order(''week_start'').then(({data,error})=>{console.log(data,error)})"

Antes bato contra uma coisa real dos bastidores deste curso: em setembro eu tinha quatro documentos diferentes de critério pra mesma Aula 2 — três, cinco, quatro mais um. Só descobri quando fui montar o slide e nada batia.

Consulto o Supabase agora, real, sem preparar. [aponta as duas linhas de Beef Wellington] Duas semanas, mesmo vídeo. Isso não estava na proposta do Claude.' }

  @{ n=6;  base='statement'; title='Repetir vídeo: 100% verificável em código.'; notes='Pergunta de debate em voz alta: isso é eval de qualidade — algo que só uma LLM pode julgar — ou é regra 100% verificável em código, tipo o casamento de nome no estoque que a Aula 2 já decidiu não virar eval?

Resposta: é verificável em código. Não vai ser um critério que o juiz decide — vai ser um sinal que o código apura, igual execucao_integra já faz com truncamento. O juiz só lê o sinal pronto.' }

  @{ n=7;  base='lista'; title='O documento final';
     bullets=@(
       'Menos o que já é código: a URL real',
       'Mais o que o dado real mostrou: a repetição',
       'Um documento só — não quatro, como na Aula 2'
     );
     notes='AÇÃO: editor aberto em evals/criterios.md, cursor no fim do arquivo. Colar o bloco novo da operação receita-premium-semanal (nao_repete_semana_anterior, escolha_ancorada_no_feed). Salvar (Ctrl+S).

O documento final não é a primeira resposta do Claude. É a primeira resposta menos o que já é código, mais o que o dado real mostrou.' }

  @{ n=8;  base='build'; title='O juiz, em código'; sub='Mesmo padrão: tool_choice forçado';
     bullets=@(
       'OPERACOES ganha o novo nome',
       'Sinal de repetição: 100% em código',
       'O juiz só lê o sinal pronto'
     );
     notes='AÇÃO: editor em evals/run-evals.js. Pedir ao Claude as três edições: (1) OPERACOES += receita-premium-semanal, linha ~58; (2) sinal repetiu_video_da_semana_anterior em montarMaterial, linha ~273; (3) entrada nova em CRITERIOS, depois de ingerir-relato, linha ~420.

COMANDO (terminal, depois de aplicar):
node evals/run-evals.js --operacao receita-premium-semanal --dry-run

E aí está: o critério de repetição, testado contra o dado real, reprova a semana de 31/08. Não porque eu programei ele pra reprovar. Porque é o que aconteceu.' }

  @{ n=9;  base='statement'; title='Isso aqui é simulado.'; notes='AÇÃO: mockup estático (não GitHub real) — título do PR, corpo, diff resumido dos três pontos do passo anterior.

Não vou dar push nem abrir PR de verdade agora. O ponto não é o clique — é que o eval que a gente construiu tem o mesmo destino de qualquer mudança de produto: revisão, diff, decisão de alguém.' }

  @{ n=10; base='statement'; title='Eu sei o que procurar. Agora falta enxergar.'; notes='CORTE.

Frase âncora se travar: "O documento final não é a primeira resposta — é a primeira resposta menos o que já é código, mais o que o dado real mostrou."' }
)

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
$nOrig = $pres.Slides.Count   # 42 — todos apagados no fim, so serviram de base

function Nova-Base([string]$kind) {
  $b = $BASES[$kind]
  $src = $pres.Slides.Item($b.slide)
  $dup = $src.Duplicate()
  $dup.MoveTo($pres.Slides.Count)
  $novo = $pres.Slides.Item($pres.Slides.Count)
  # Duplicate() herda SlideShowTransition.Hidden da base — o slide 6 do deck
  # fonte (base 'statement') estava oculto la (motivo do fonte desconhecido),
  # e isso vazou pros 5 slides gerados a partir dele (achado 16/09). Todo
  # slide gerado tem que comecar visivel.
  $novo.SlideShowTransition.Hidden = 0
  return $novo
}

$feitos = 0
foreach ($it in $itens) {
  $b = $BASES[$it.base]
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

  if ($it.tabela -and $it.table.Count) {
    # statement vira titulo no alto + tabela nativa embaixo (mesmo padrao do slide 39 original)
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
        $cell.Shape.Fill.ForeColor.RGB = if ($r -eq 1) { 0x5A2E10 } else { 0x1A1A1A }
        if ($c -gt 1) { $cell.Shape.TextFrame.TextRange.ParagraphFormat.Alignment = 2 }
      }
    }
  }

  if ($it.notes) {
    try {
      $ph = $null
      foreach ($ns in $sl.NotesPage.Shapes) {
        if ($ns.Type -eq 14 -and $ns.PlaceholderFormat.Type -eq 2) { $ph = $ns }
      }
      if ($null -eq $ph) { throw 'nenhum placeholder de notas' }
      $ph.TextFrame.TextRange.Text = ($it.notes -replace "`n", "`r")
    } catch { Write-Warning "slide #$($it.n): sem placeholder de notas ($_)" }
  }
  $feitos++
}

# Apaga os 42 slides originais (serviram so de base)
for ($i = $nOrig; $i -ge 1; $i--) { $pres.Slides.Item($i).Delete() }

$pres.Save()
$total = $pres.Slides.Count
$pres.Close()
$app.Quit()
Write-Host "OK: $feitos slides gerados, $total no arquivo -> $Out"
