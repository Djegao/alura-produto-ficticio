# Aula 3 — avaliação do material e plano (16/09)

Documento de debate. Mesmo papel que o `aula2-avaliacao-e-plano.md` teve na
Aula 2: fechar as decisões **antes** de gerar o deck. O script proposto está em
[`aula3-script.md`](aula3-script.md), e os números, em
[`apoio/aula3-dados-congelados.md`](apoio/aula3-dados-congelados.md).

---

## 1. A ata e o espelho

Existem duas fontes oficiais, e elas **não têm a mesma estrutura**.

**Ata da coordenação** (registrada em `docs/rascunho-coordenacao.html`, §02):
a Aula 3 tem **3 vídeos**.

| Vídeo | Objetivo |
|---|---|
| Conhecendo o Langfuse | Navegar a interface e configurar como ferramenta de observabilidade. |
| Lendo os dados de produção | Interpretar volume, latência, erros e variações de qualidade. |
| Padrões de falha | Identificar padrões recorrentes de degradação usando dados do Langfuse. |

**Espelho oficial** (`Curso Alura - Montagem do Curso.csv`, o que vai pra
plataforma): **4 vídeos + 1 texto**, sem tempo informado.

| # | Título | Objetivo de aprendizagem (literal) |
|---|---|---|
| 3.1 | O que é observabilidade? | Entender o que significa observar um produto com IA em produção: quais dados capturar, o que eles revelam e por que isso muda a forma de operar o produto. |
| 3.2 | Conhecendo o Langfuse | Navegar pela interface do Langfuse, entender sua estrutura de dados e configurá-lo como ferramenta de observabilidade do produto fictício de referência. |
| 3.3 | Lendo os dados de produção | Interpretar os dados gerados pelo Langfuse em produção: volume de uso, latência, erros e variações de qualidade ao longo do tempo. |
| 3.4 | Padrões de falha | Identificar padrões recorrentes de falha e degradação nas respostas do produto, usando os dados do Langfuse para encontrar onde e quando o produto piora. |
| 3.5 | O que aprendemos? | *(Explicação — texto)* |

O espelho é a versão mais nova (a Aula 2 teve a mesma evolução: a ata listava
3 vídeos e o espelho, 4). **O script segue o espelho**, pela mesma decisão da
Aula 2: "títulos = espelho".

A ata também trazia um **preparo conceitual** (`rascunho-coordenacao.html`,
§06–07) que o material de 14/09 não usava. O script recupera tudo:

| Preparo conceitual da ata | Onde está no script |
|---|---|
| "Onde seus dados vão morar?" — nuvem × Docker × produção; decisão de conformidade, fio pra Aula 5 | 3.2 · slide 2 |
| Plano gratuito (limite de uso, 30 dias) | 3.2 · slide 3; 3.3 · slide 9 |
| Volume: pico não é sempre bom sinal | 3.3 · slide 5 |
| Latência: olhar percentil alto, não a média | 3.3 · slide 6 |
| **Erro técnico × resposta ruim**: "o sistema respondendo errado com toda confiança" | 3.3 · slide 7 → 3.4 · slides 2–4 |
| Qualidade ao longo do tempo depende de o eval escrever nota de volta | 3.3 · slide 8 |
| "Tempo real quase nunca é instantâneo" (lag de ~45 s) | 3.2 · slide 10 |

### Matriz objetivo → slide

| Objetivo do espelho | Coberto em |
|---|---|
| 3.1 quais dados capturar | slide 9 (caminho, conta, desfecho) |
| 3.1 o que eles revelam | slide 8 (a sexta reconstruída) |
| 3.1 por que muda a forma de operar | slides 10–11 |
| 3.2 navegar a interface | slides 4–5 (lista, árvore), 7 e 9 (antes/depois), 3.4·4 |
| 3.2 estrutura de dados | slide 4 (Trace · Observation · Score) |
| 3.2 configurar | slides 6, 7, 9 |
| 3.3 volume · latência · erros · qualidade no tempo | slides 5 · 6 · 7 · 8 |
| 3.4 padrões recorrentes | slides 2–4 (uma assinatura, nove casos) |
| 3.4 degradação | slide 7 |
| 3.4 onde e quando piora | slides 5–6 |

---

## 2. O material que já existia

| Documento | Data | Estado |
|---|---|---|
| `aula3-roteiro.md` | 29/08 | outline; números de 22/08 (68 traces), vencidos |
| `aula3-ensaio-falas.md` + `slides/aula3-alura.pptx` (21 slides) | 14/09 | ensaio "Tela · Fazer · Dizer", no deck de gerador antigo (`gerador-alura`) |
| `SCRIPT-LINEAR-CURSO.md`, seção Aula 3 | 12/09 | histórico (formato linear superado) |

### O que fica (e está no script novo)

- "Observar é reconstruir, não registrar o evento."
- A regra "nenhuma chamada da IA sem rastro", e a de ligar antes de tudo.
- "Desligar o rastro não quebra o produto."
- O antes/depois local, e as três armadilhas: reiniciar o servidor, **não usar
  o Telegram**, e o banco ser o mesmo de produção.
- O aviso do lag de ~45 s, e a coreografia de "voltar pro slide e falar".
- "Um quarto das chamadas, nove de cada dez dólares."
- "Nenhuma delas gritou" (vira "Nenhuma delas me avisou").
- A voz de product builder: nada de arquivo, linha ou variável de ambiente na fala.

### O que não se sustenta mais (com a evidência)

| # | Afirmação de 14/09 | Problema | Evidência |
|---|---|---|---|
| 1 | "38 interações, US$ 1,53, 26% / 90%" | As 4 mensagens do hambúrguer entraram depois. Hoje: 42, US$ 1,54, **24%** / 90% | dados congelados §1 |
| 2 | "Nada falha, nada avisa" (antes/depois) | **O SDK avisa**: 2 linhas `[WARN]` na subida | dados congelados §9, teste local de 16/09 |
| 3 | Slide 13: trocar o modelo ao vivo e comparar 1 trace com 1 trace | É "testar uma vez", o que a Aula 2 inteira ensina a não fazer. E escreve no banco de produção | Aula 2, slide "Testar uma vez responde sobre aquele momento" |
| 4 | Slide 16: "reproduzir o corte ao vivo é o conteúdo da próxima aula" | A Aula 4 foi reescrita em 14/09 e **não tem** o truncamento. Promessa quebrada | `aula4-ensaio-falas.md` (19 slides, nenhum de truncamento) |
| 5 | "Cinco falhas que eu achei **olhando**" | O `\|\| []` do Kanban foi achado por **teste ponta a ponta**, não observando. E o Kanban não existe mais: não há o que mostrar | SDD §11.6, §14 |
| 6 | "Use sempre aquisição: *comprei tomate*" | Cria item no estoque real e pode marcar item da lista de compras como comprado. **Desejo** não mexe em estado nem manda nada pro Telegram | `intencao-efeitos.js`, `tools.js` (`marcarCompradoNaLista`) |
| 7 | "Hoje são 39 notas em 9 interações" | Continua verdade, mas 3 das 9 já saíram da janela, **nenhuma** sobra a partir de 23/09, e as 39 foram escritas **no mesmo dia** (não há série no tempo) | dados congelados §7 |
| 8 | "A quinta eu encontrei **ontem à noite**" | Data relativa. A Aula 4 diz o mesmo; as duas não podem ser verdade ao mesmo tempo | `aula4-ensaio-falas.md`, slides 1 e 11 |
| 9 | A falha mais forte não estava no material | **9 das 10 mediações não chegaram inteiras**, e isso é 77% da conta do produto. Estava num inventário da Aula 2 ("só um chegou inteiro") e nunca entrou na Aula 3 | `apoio/aula2-demos-congeladas.md`, inventário de 03/09 |

---

## 3. O que os dados de 16/09 mudaram

1. **O padrão central do 3.4 é atual e visível no painel**: o teto de tokens
   do Mediador. Uma assinatura (tokens de saída = teto), quatro sintomas
   (erro, vazio, cortado, "Consultei"), nove de dez casos.
2. **A tela do produto mente num caso concreto**: "(proposta registrada sem
   texto)" aparece quando a proposta gravada está vazia (`{}`), conferido no
   banco.
3. **Vermelho mente pros dois lados**: a nota por foto é erro no painel e não é
   falha; seis mediações quebradas não disparam alarme nenhum (o painel só pinta
   erro — não existe "verde" no Langfuse, é vermelho vs. sem cor).
4. **A sexta de 28/08** reconstrói, com rastro, exatamente as duas perguntas que
   a Aula 2.5 recusou como eval ("saiu no prazo?"). É a ponte natural entre as
   aulas.
5. **A retenção não é teoria**: a janela perde metade dos dados em 21/09, com a
   maior parte das mediações dentro.

---

## 4. Círculo 0 — decisões para o debate

Cada uma com a minha recomendação. O script já está escrito seguindo a
recomendação; mudar qualquer uma é trocar poucos slides.

| # | Decisão | Opções | Recomendo | Por quê |
|---|---|---|---|---|
| 1 | Estrutura | ata (3 vídeos) × espelho (4 + texto) | **espelho** | é o que vai pra plataforma; mesma decisão da Aula 2 |
| 2 | Mestre único | novo `aula3-script.md` × evoluir o ensaio de 14/09 | **novo mestre**; roteiro e ensaio antigos viram histórico | a Aula 2 travou com quatro documentos concorrentes; o gerador de deck atual lê este formato |
| 3 | Data de gravação | até dom 20/09 × depois | **até 20/09**, mas o script já aguenta as duas | depois de 21/09 somem 8 das 10 mediações e a lasanha do painel |
| 4 | Centro do 3.4 | lista das cinco falhas × padrão do Mediador + pontos cegos | **padrão do Mediador** | é o único que cumpre "recorrente + onde + quando" com o painel; A/B/C/D são o núcleo da Aula 4 |
| 5 | Episódios C, D e B no 3.4 | fora × diagnóstico × só identificar | **só identificar** (1 slide: estado, sequência, ausência) | planta a Aula 4 sem roubar o diagnóstico |
| 6 | Troca de modelo ao vivo (slide 13 antigo) | manter × cortar | **cortar**; o número anotado de 22/08 vira exemplo de retenção | n=1 contradiz a Aula 2; escreve no banco |
| 7 | Frases do antes/depois | aquisição × desejo | **desejo** ("pastel de feira", "caldo de cana") | não mexe em estoque, lista nem Telegram; entra 1 item no feed por frase |
| 8 | Qualidade ao longo do tempo | "uma foto não é um filme" × rodar o pipeline de novo antes de gravar (grava notas novas no Langfuse, custa centavos) | **enquadramento honesto**; rodar de novo só se você quiser 2 pontos no gráfico | deixa o gancho da Aula 4 intacto; rodar escreve no Langfuse, então é decisão sua |
| 9 | A sexta da chave revogada (3.1) | usar × trocar por exemplo neutro | **usar** | é erro operacional seu, real e datado. A persona confia em experiência real; e é a ponte com a 2.5 |
| 10 | O "porquê" do teto do Mediador | explicar na 3.4 × não afirmar | **não afirmar** | o conteúdo do bloco de raciocínio não fica gravado; a hipótese (o raciocínio consome o orçamento antes do texto) é diagnóstico, logo Aula 4 |
| 11 | Corrigir o teto do Mediador | corrigir × preservar | **preservar** até decidir (convenção do projeto) | é a falha mais cara do produto; a decisão afeta a Aula 4 (ver §6) |
| 12 | Vocabulário na tela | só palavra de produto × palavra de produto + rótulo em inglês | **os dois** ("Trace = interação") | a persona precisa navegar sozinha num painel em inglês |
| 13 | Entregáveis que o aluno leva | — | **Quatro perguntas pro seu painel** (3.3), **Assinatura · Frequência · Ponto cego** (3.4), **prompt pra instrumentar o próprio produto** (3.2) | critério de confiança da persona; equivalente às três perguntas da Aula 2 |
| 14 | Nome do projeto no Langfuse | deixar "Chef Caseiro" × renomear pra "Musa Balance" antes de gravar | **renomear** (nome de exibição; conferir que não mexe nas chaves) | aparece na tela em três vídeos |
| 15 | Pico de 21–22/08 | "foi eu preparando e dando uma aula ao vivo" | **confirmar comigo** | os traces de 21/08 à noite são de produção e da máquina local; a leitura é minha |

---

## 5. Riscos

| Risco | Quando | Mitigação no script |
|---|---|---|
| Metade da janela some (42 → 21) | 21/09 | slides congelados + falas marcadas *(se gravar a partir de 21/09)* |
| Nenhuma interação com nota visível na lista | a partir de 23/09 | apoio: abrir a página de notas (lista até ~27/09) ou narrar |
| Nova receita premium entra | sex 18/09, ~7h20 | +1 interação: "o painel já andou" é conteúdo |
| Trace `1ecca5e6` (fio 3.2 → 3.4) sai | ~02/10 | extrato preservado em `traces-preservados/` |
| O `[WARN]` não aparecer igual ao teste | demo 3.2 | validar fora do ar; fala alternativa no apoio |
| Rede intermitente (antivírus e TLS) | demos | abrir o Langfuse antes do REC pra aquecer |
| Frase de desejo classificada como outra coisa | demo 3.2 | validar 1 frase fora do ar; o `aplicarIntencao` de desejo não mexe em estado |

---

## 6. Efeitos na Aula 4 (alinhar depois de fechar a Aula 3)

Não mexi na Aula 4. Pontos que ficam inconsistentes se o script da Aula 3 for
aprovado:

1. **Slides 4–5**: reapresentam "38 interações, US$ 1,53, 26% / 90%" como
   "mesmo recorte da Aula 3". Precisam dos números de 16/09 (ou citar a Aula 3
   sem repetir a tabela).
2. **Slide 5**: "foi o que eu fiz na aula passada, trocando o modelo de
   classificação" → a troca ao vivo sai da Aula 3 (decisão 6).
3. **Slide 3**: "existem duas falhas ativas" → com o teto do Mediador, são
   **três**, e a terceira é a mais cara.
4. **Slides 1 e 11**: "ontem à noite" (episódio D) → usar a data.
5. **O teto do Mediador fica identificado e não diagnosticado.** A Aula 4 hoje
   não o menciona. Decidir se ele entra no diagnóstico (4.2), na lista de
   riscos aceitos (4.4) ou nos dois.

---

## 7. Persona — como o script responde

Referência: [`persona-ai-product-builder.md`](persona-ai-product-builder.md), §4.

| Da persona | Resposta no script |
|---|---|
| Medo de ferramenta paga sem aviso | 3.2·3: custo antes da conta ("grátis até 50 mil; meu produto usa 0,5%") e o limite real (30 dias) |
| Critério: prompts e templates reutilizáveis | 3.3·10 (Quatro perguntas), 3.4·9 (Assinatura · Frequência · Ponto cego), prompt de instrumentação no apoio |
| Abandona com "leitura de tela" | três convites pra pausar e aplicar no próprio painel (3.3·10, 3.4·9, Faça como eu fiz do 3.2) |
| Autonomia × passo a passo | fala em nível de produto; clique exato e rótulos em inglês no apoio |
| Profundidade de aplicação × direto ao ponto | ~40 min, 45 slides, uma ideia por slide, e cada bloco fecha com uma frase curta |
| Desconfia de construir sem base técnica | a aula mostra honestamente o que quebrou (9 de 10, a chave revogada, a tela que mente) |
| Critério: experiência real do instrutor | tudo é dado do meu produto, com data e trace |
| Modelo mental: influência na empresa | "um quarto das chamadas, noventa por cento da conta"; "77% da conta não chegou inteira" |
| Não conseguir replicar fora do curso | antes/depois reproduzível em qualquer produto; Faça como eu fiz com conta gratuita |

---

## 8. Ordem de trabalho depois do debate

| Círculo | Entrega | Aprovação = |
|---|---|---|
| 0 | As decisões da §4 | sua resposta |
| 1 — demos | validar fora do ar: `[WARN]` + frase de desejo + lag; revalidar números com `scripts/aula3-retrato-langfuse.js` | saídas conferidas |
| 2 — 3.1 a 3.4 | ajustar o script vídeo a vídeo com as decisões | você lê e aprova |
| 3 — 3.5 | fechar `aula3-o-que-aprendemos.md` | idem |
| 4 — deck | gerar o `.pptx` inicial a partir do script e de `aula3-bases.md` (mesmo caminho da 2.5); finalização no Google Slides | — |
| 5 — Aula 4 | alinhar os pontos da §6 | — |
