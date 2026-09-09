# Aula 2 — apoio: saída do pipeline de evals

Fallback de gravação para o vídeo **2.4 (Primeiro conjunto de evals)**. Se a
API falhar ao vivo, é daqui que sai o que aparece na tela.

> ## ✅ ESTADO EM 28/08/2026 — RESOLVIDO
>
> O pipeline **rodou de verdade** em 28/08 às 13h: 9 interações reais de
> produção julgadas e **39 Scores gravados no Langfuse**. Os resultados
> agregados estão na seção "Rodada real" abaixo.
>
> Histórico do bloqueio, porque explica a chave atual: a
> `ANTHROPIC_API_KEY` antiga estava revogada (401), o que tinha derrubado
> **todas** as chamadas de LLM em produção desde ~24/08. A conta emite
> chaves **identity-linked**, que exigem também
> `ANTHROPIC_WORKSPACE_ID=wrkspc_01DEmvYfoN3SESEnSYfinMmH` — sem essa
> variável a chave é válida mas devolve 400. Hoje as duas variáveis estão
> no `.env` **e** no Railway, produção foi redeployada e verificada
> (401 do Basic Auth, API respondendo, webhook do Telegram sem erro).
> Detalhes e armadilhas em [`../SETUP-MAQUINA-ESCOLA.md`](../SETUP-MAQUINA-ESCOLA.md) §0.

---

## Comando exato a rodar na aula (vídeo 2.4)

```bash
node evals/run-evals.js
```

Esse é o comando que o `docs/aula2-roteiro.md` já promete. Ele roda o
conjunto padrão: **4 traces por operação** × 3 operações, grava os Scores no
Langfuse e imprime o resumo agregado.

Variações úteis se o tempo apertar ou a rede estiver ruim:

```bash
node evals/run-evals.js --limit 2                 # rodada curta (6 traces)
node evals/run-evals.js --dry-run --limit 3       # julga e mostra, sem gravar
node evals/run-evals.js --operacao sugerir-receita --limit 3
```

**Antes de rodar, avise a turma:** o Score não aparece na UI na hora. O
Langfuse Cloud tem ~45s de lag de ingestão (achado §11.2 do SDD). Isso é
conteúdo, não acidente — o roteiro do 2.4 já usa isso como demonstração.

---

## Como conferir os Scores no Langfuse (caminho de UI)

1. Abrir `https://us.cloud.langfuse.com` e entrar no projeto do Chef Caseiro.
2. Menu lateral → **Tracing → Traces**.
3. A lista de traces tem coluna de **Scores**; dá pra filtrar por
   `name = consumo_registrado`, `value < 0.5`, etc. É essa tela que a Aula 3
   reusa pra falar de "qualidade ao longo do tempo".
4. Clicar num trace → aba **Scores** (ao lado de Observations). Cada critério
   aparece como uma linha com o valor e o `comment` do juiz — o comentário é
   a justificativa com a evidência citada, prefixada por `[juiz claude-sonnet-5]`.
5. Se acabou de rodar e não apareceu nada: **espere ~1 minuto e recarregue**.

Conferência pela API (o que o script faz e o que dá pra mostrar no terminal):

```bash
curl -s -u "$LANGFUSE_PUBLIC_KEY:$LANGFUSE_SECRET_KEY" \
  "$LANGFUSE_BASE_URL/api/public/scores?limit=20" | jq '.data[] | {name, value, traceId}'
```

---

## O que já está VERIFICADO (execução real de 28/08)

Tudo abaixo é saída real, não simulada.

### 1. Leitura de traces da API pública do Langfuse — OK

`GET /api/public/traces` respondeu `200` com **76 traces** no projeto:

| operação | traces disponíveis |
|---|---|
| `ingerir-relato` | 34 |
| `sugerir-receita` | 13 |
| `mediar-cardapio` | 12 |
| (outros: `ingerir-nota-fiscal`, `receita-premium-semanal`) | 17 |

### 2. Escrita e leitura de Score — OK

`POST /api/public/scores` aceitou os dois formatos usados pelos critérios,
`NUMERIC` e `BOOLEAN`, respondendo `200` com o id do Score:

```
POST smoke_numeric 200 {"id":"fd54e7fd-b879-4383-92c9-4c9b7ca610b1"}
  DELETE 202
POST smoke_boolean 200 {"id":"8857ff2f-32a8-4252-a3f8-ae897941fac4"}
  DELETE 202
```

(Os dois Scores de teste foram **apagados** em seguida — o projeto ficou
limpo, sem lixo de smoke test.)

### 3. Sinais apurados em código — OK, e reproduzem o achado §11.4

Este é o bloco que o juiz recebe pronto. Saída real de três traces de
produção:

```
--- sugerir-receita 57debf7a71533fdc6a9e7a982595ba7c
  ferramentas: ["consultar_preferencias","consultar_estoque"]
  sinais: {"truncamento_por_max_tokens":true,"houve_observacao_em_erro":true,"saida_final_vazia":true,
           "total_de_tool_calls":2,"registrou_consumo":false,...}
  chamadas: [{"nome":"chamada-claude","modelo":"claude-sonnet-5","tokens_entrada":7448,
              "tokens_saida":1024,"bateu_no_teto_de_max_tokens":true},
             {"nome":"chamada-claude","modelo":"claude-sonnet-5","tokens_entrada":1229,
              "tokens_saida":79,"bateu_no_teto_de_max_tokens":false}]

--- ingerir-relato 078afc7fb4e4073a5303dfc09f77ccf1
  ferramentas: []
  sinais: {"truncamento_por_max_tokens":false,"houve_observacao_em_erro":false,
           "saida_final_vazia":false,"total_de_tool_calls":0,...}
  chamadas: [{"nome":"classificar-intencao","modelo":"claude-haiku-4-5","tokens_entrada":2501,
              "tokens_saida":129,"bateu_no_teto_de_max_tokens":false}]

--- mediar-cardapio efae9192250525b599117ca7e25864bc
  ferramentas: ["registrar_decisao_cardapio","consultar_preferencias","consultar_relatos_recentes",
                "consultar_orcamento_semanal","consultar_estoque","consultar_validade_estoque"]
  sinais: {"truncamento_por_max_tokens":true,"houve_observacao_em_erro":false,
           "saida_final_vazia":false,"total_de_tool_calls":6,"registrou_decisao_cardapio":true,...}
  chamadas: [{"nome":"forcar-registro-decisao","modelo":"claude-sonnet-5","tokens_entrada":18539,
              "tokens_saida":1024,"bateu_no_teto_de_max_tokens":true},
             {"nome":"chamada-claude","modelo":"claude-sonnet-5","tokens_entrada":16307,
              "tokens_saida":2048,"bateu_no_teto_de_max_tokens":true},
             {"nome":"chamada-claude","modelo":"claude-sonnet-5","tokens_entrada":3789,
              "tokens_saida":212,"bateu_no_teto_de_max_tokens":false}]
```

**Duas coisas dignas de nota para a aula:**

- O trace `57debf7a…` é **exatamente** o trace citado no SDD §11.4: 1024
  tokens de saída (o teto), observação em `ERROR`, saída final vazia. O
  pipeline de evals detecta o achado sozinho, em código, sem o juiz. É a
  ilustração perfeita de "eval de integridade vem antes de eval de
  qualidade".
- **Achado novo, ainda não documentado no SDD:** o `mediar-cardapio` também
  está truncando — as duas chamadas maiores bateram nos tetos de 2048 e 1024
  do `agent.js`. Ou seja, o §11.4 **não é só do v1/v2**; alcançou o Mediador
  também, à medida que o estoque cresceu (18.539 tokens de entrada). Vale
  decidir antes de gravar se isso é conteúdo (preservar) ou correção — pela
  convenção de processo do projeto, **não mexer sem combinar**.

### 4. Comportamento de erro — OK (nada em silêncio)

A rodada abaixo é a saída literal de `node evals/run-evals.js --dry-run
--limit 1 --sem-cor` em 28/08. Ela **falha**, de propósito: é o retrato do
bloqueio da chave, e serve de demonstração de como o pipeline reporta erro
(desembrulhando a causa real em vez de mostrar um genérico "fetch failed").

```
  Chef Caseiro — pipeline de evals
  interacoes reais do Langfuse -> juiz (claude-sonnet-5) -> Scores de volta no trace

  Langfuse: https://us.cloud.langfuse.com   modo: DRY-RUN (nao grava)
  Operacoes: sugerir-receita, mediar-cardapio, ingerir-relato   limite: 1 por operacao
  ──────────────────────────────────────────────────────────────────────────────

  sugerir-receita

  [1/1] 57debf7a7153...  FALHOU
    Error: A Anthropic recusou a chave (401 authentication_error). A ANTHROPIC_API_KEY do .env esta invalida ou revogada — gere uma nova em console.anthropic.com > API Keys e atualize o .env (e o Railway, se producao usar a mesma).
    Error: 401 {"type":"error","error":{"type":"authentication_error","message":"API key is invalid."},"request_id":null} (status=401)

  mediar-cardapio

  [1/1] efae91922505...  FALHOU
    Error: A Anthropic recusou a chave (401 authentication_error). A ANTHROPIC_API_KEY do .env esta invalida ou revogada — gere uma nova em console.anthropic.com > API Keys e atualize o .env (e o Railway, se producao usar a mesma).
    Error: 401 {"type":"error","error":{"type":"authentication_error","message":"API key is invalid."},"request_id":null} (status=401)

  ingerir-relato

  [1/1] 078afc7fb4e4...  FALHOU
    Error: A Anthropic recusou a chave (401 authentication_error). A ANTHROPIC_API_KEY do .env esta invalida ou revogada — gere uma nova em console.anthropic.com > API Keys e atualize o .env (e o Railway, se producao usar a mesma).
    Error: 401 {"type":"error","error":{"type":"authentication_error","message":"API key is invalid."},"request_id":null} (status=401)

  ==============================================================================
  RESUMO
  ==============================================================================
  nenhum trace foi julgado com sucesso.

  DRY-RUN: nenhum Score foi gravado no Langfuse.

  3 falha(s) — nada foi engolido em silencio:
   - sugerir-receita / 57debf7a7153... (julgar/gravar)
     Error: A Anthropic recusou a chave (401 authentication_error). [...]
    Error: 401 {"type":"error","error":{"type":"authentication_error","message":"API key is invalid."},"request_id":null} (status=401)
   - mediar-cardapio / efae91922505... (julgar/gravar)
     Error: A Anthropic recusou a chave (401 authentication_error). [...]
    Error: 401 {"type":"error","error":{"type":"authentication_error","message":"API key is invalid."},"request_id":null} (status=401)
   - ingerir-relato / 078afc7fb4e4... (julgar/gravar)
     Error: A Anthropic recusou a chave (401 authentication_error). [...]
    Error: 401 {"type":"error","error":{"type":"authentication_error","message":"API key is invalid."},"request_id":null} (status=401)
```

(Na saída literal, a linha `[...]` traz a mensagem de diagnóstico completa —
encurtada aqui só pra caber na página.)

Note que o Langfuse foi consultado com sucesso nas três operações (os traces
foram encontrados e carregados); a única coisa que falhou foi a chamada ao
juiz.

---

## Rodada real — 28/08/2026, 13h (`--limit 3`)

Saída literal do resumo agregado. **39 Scores gravados no Langfuse**, 9
interações reais julgadas. Estes números já estão no dashboard e podem ser
mostrados na aula mesmo sem rodar nada ao vivo.

```
  RESUMO
  ==============================================================================

  sugerir-receita  (3 interacoes julgadas)
    execucao_integra        0.33  #######.............  binario · 2 reprovado(s)
    fidelidade_ao_estoque   0.17  ###.................  0-1 · 2 reprovado(s)
    respeito_as_restricoes  0.33  #######.............  binario · 2 reprovado(s)
    consumo_registrado      0.67  #############.......  binario · 1 reprovado(s)

  mediar-cardapio  (3 interacoes julgadas)
    execucao_integra        0.33  #######.............  binario · 2 reprovado(s)
    trade_off_com_numeros   0.30  ######..............  0-1 · 2 reprovado(s)
    numeros_de_tool         0.67  #############.......  binario · 1 reprovado(s)
    mediou_sem_decidir      0.33  #######.............  binario · 2 reprovado(s)
    falta_virou_trade_off   0.33  #######.............  binario · 2 reprovado(s)

  ingerir-relato  (3 interacoes julgadas)
    execucao_integra        1.00  ####################  binario
    tipo_correto            0.67  #############.......  binario · 1 reprovado(s)
    sem_invencao_numerica   1.00  ####################  binario
    ancoragem_no_texto      0.67  #############.......  0-1 · 1 reprovado(s)

  media geral do conjunto: 0.52  (39 scores em 9 interacoes)

  39 Scores enviados ao Langfuse.
```

### Por que esse resultado é ouro para as Aulas 3 e 4

Não force a leitura na hora — ela já vem pronta destes números:

- **`execucao_integra` em 0.33 nas duas operações de geração.** Dois de
  cada três traces de `sugerir-receita` e de `mediar-cardapio` estão
  **estruturalmente quebrados** — truncamento por `max_tokens`, observação
  em erro ou saída final vazia. É o achado §11.4 aparecendo como número, e
  não como anedota. E confirma que o truncamento **alcançou o Mediador**,
  não é mais só do v1/v2.
- **O contraste entre operações conta a história sozinho.** `ingerir-relato`
  (haiku, tarefa simples, barata) tem integridade perfeita; as operações
  caras e complexas é que degradam. Esse é exatamente o argumento do vídeo
  3.3 sobre custo × qualidade.
- **`fidelidade_ao_estoque` em 0.17 é o pior número do conjunto** — e é a
  promessa central do produto. Um eval que aponta para o coração da
  proposta de valor é o melhor exemplo possível de "priorize o erro mais
  caro" (vídeo 2.4).
- **Um reprovado em `tipo_correto` foi o trace da mensagem "Ingerir"**, sem
  conteúdo nenhum: o agente inventou um relato de refeição a partir de um
  verbo solto. É um caso real de alucinação por entrada degenerada, pego
  pelo eval — bom material para o vídeo 4.2 (diagnóstico: prompt, dado ou
  modelo?).

Para gerar uma saída nova e completa em arquivo, se quiser:

```bash
node evals/run-evals.js --limit 5 --sem-cor > docs/apoio/saida-evals-bruta.txt 2>&1
```

Formato esperado da saída (é o que o script imprime; serve de referência
visual pra montar o slide antes de ter a saída real):

- Um cabeçalho com Langfuse, modo (`GRAVANDO SCORES` / `DRY-RUN`), operações
  e limite.
- Um bloco por operação, e dentro dele um bloco por trace com: id abreviado,
  data UTC, o pedido do usuário resumido, alertas em vermelho dos sinais
  apurados em código (truncamento / erro), e **uma linha por critério** com
  símbolo (`OK` / `~` / `X`), nome, nota, barra e a justificativa do juiz.
- No fim, `RESUMO`: média por critério dentro de cada operação (com barra e
  contagem de reprovados), média geral do conjunto, total de Scores enviados
  e o lembrete do lag de 45s.

---

## Plano B durante a gravação

1. Se a chamada ao juiz falhar ao vivo: mostre `evals/criterios.md` e o bloco
   de `tool_choice` em `evals/run-evals.js` (é o conteúdo do 2.3 de todo
   jeito) e vá para o Langfuse mostrar Scores de uma rodada anterior.
2. Se o Langfuse não responder: rode `--dry-run`. O julgamento aparece no
   terminal inteiro, só não é gravado.
3. Se nada funcionar: leia esta página. O que está aqui é execução real e
   pode ser mostrado como captura.
