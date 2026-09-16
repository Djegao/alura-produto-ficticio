# Aula 2 — demos congeladas (círculo 1, 03/09)

Tudo aqui é **saída real** do `evals/run-evals.js`, rodado em 03/09 entre 18h
e 19h (horário local) contra traces reais de produção. Nenhum número foi
inventado. As **notas** são estáveis entre rodadas (o mesmo trace tirou o mesmo
0/1 em duas execuções); a **redação** das justificativas varia, porque é o
juiz escrevendo. Se a rodada ao vivo vier com frase diferente, é normal.

**Por que os traces estão pinados:** o `--limit N` traz "os mais recentes por
operação", e qualquer uso novo do produto muda o que aparece na tela. Foi o que
aconteceu hoje: dois testes de carbonara às 19h34 e 19h36 (UTC) empurraram o
trace que o ensaio prometia para segundo lugar. A opção `--trace` foi
adicionada ao script por isso (aditiva; nada mais mudou).

---

## Pré-flight (imediatamente antes do REC)

```bash
.\scripts\observabilidade.ps1 status        # tem que dizer LIGADA
node evals/run-evals.js --help              # confirma que --trace existe
```

Terminal na raiz do repo, fonte grande, `--sem-cor` **não** (a cor ajuda na
tela). Não abrir a interface do Langfuse: é o vídeo 3.2.

---

## Demo 2.3 — o juiz julga UMA mediação (~15 s)

### Comando (recomendado): a mediação do risoto

```bash
node evals/run-evals.js --dry-run --trace 9f8bb3c520bca952adff5825cf213c84
```

(Id completo de propósito: prefixo obriga o script a listar traces, e o
Langfuse Cloud limita essas listagens a 15 por minuto. Com id completo, zero
listagem.)

Trace `9f8bb3c520bca952adff5825cf213c84` · 2026-08-22 00:25 UTC · pedido:
*"Fazer risoto de camarão neste sábado"*.

| Critério | Nota | Justificativa (resumo do que o juiz escreveu) |
|---|---|---|
| `execucao_integra` | **0.00** | truncamento por max_tokens; a saída termina cortada em *"olhei os relatos recentes (nenhum delivery/restaur"* |
| `trade_off_com_numeros` | 0.50 | há números concretos de estoque (1 kg camarão, 200 g manteiga, 150 g parmesão), mas a resposta foi cortada antes de amarrar número à decisão |
| `numeros_de_tool` | **1.00** | todos os números citados batem exatamente com `consultar_estoque` / `verificar_disponibilidade`; teto calórico/financeiro `null` vem direto de `consultar_orcamento_semanal` |
| `mediou_sem_decidir` | **1.00** | apresentou o conflito (vinho tinto vs branco) e perguntou *"Querem manter o branco ou preferem adaptar a receita?"* |
| `falta_virou_trade_off` | **0.00** | **o texto afirma que o alho "já coloquei na lista de compras", mas `registrou_lista_compras = false`** — a ação dita não foi executada por nenhuma ferramenta |

**Por que este e não outro:** uma mediação só, três vereditos diferentes, e a
última linha é a aula inteira do 2.3 em uma frase. O Mediador *disse* que
colocou na lista; o trace prova que não chamou a ferramenta. Lendo à mão eu
acreditaria. O juiz não acreditou porque ele enxerga o caminho inteiro.

**Leia em voz alta:** `numeros_de_tool 1.00` e `falta_virou_trade_off 0.00`.

### Alternativa: a mediação cortada em "Ovos brancos"

```bash
node evals/run-evals.js --dry-run --trace 5e9799eaf011d6c7fa9208a8ae4acd49
```

Trace `5e9799eaf011d6c7fa9208a8ae4acd49` · 2026-09-03 19:34 UTC · pedido:
*"Quero fazer um espaguete a carbonara hoje."*

| Critério | Nota |
|---|---|
| `execucao_integra` | 0.00 — cortada no meio da frase *"Ovos brancos"* |
| `trade_off_com_numeros` | 0.00 |
| `numeros_de_tool` | **1.00** — o único número que sobrou (2,5 kg de macarrão) bate com `verificar_disponibilidade` |
| `mediou_sem_decidir` | 0.00 |
| `falta_virou_trade_off` | 0.00 — pancetta, bacon e pimenta faltando, sem lista de compras |

Ponto desta versão: o mesmo truncamento tira 0 num critério e 1 no outro, e os
dois estão certos. É a prova de que critério não é redundante.

---

## Demo 2.4 — o conjunto inteiro (~1 min)

### Comando (recomendado): 4 traces, só vocabulário da aula

```bash
node evals/run-evals.js --dry-run --trace 652b38032d3ce3953b4758e607c40223,d807057bd0808ca94dc63c8a0970f328,fc52a27f08c7cd11be8e0894d1e34ccf,724d2cf3a53efbfa29ad53fde19a3cda
```

Julga, nesta ordem: duas mediações (o par abaixo) e dois relatos de ingestão.
Tempo medido em 03/09: **31 s** para 4 traces com ids completos (a rodada
com prefixos levou 58 s, por causa das listagens).

### 🎯 O momento mais forte da aula: o par do Mediador

Mesmo pedido, palavra por palavra — *"Vamos fazer carbonara. Preciso da lista
de compras"* — no mesmo dia, 22/08, com cinco horas de diferença:

| Critério | 11:16 UTC (`d807057bd080`) | 16:01 UTC (`652b38032d3c`) |
|---|---|---|
| `execucao_integra` | **0.00** (bateu no teto 2048 e 1024; saída vazia) | **1.00** (9 tool calls, todas `ok:true`) |
| `trade_off_com_numeros` | 0.00 | 0.70 (números de estoque e da lista, mas sem custo do bacon de peru vs tradicional) |
| `numeros_de_tool` | 0.00 | **1.00** (400 g de 2,5 kg de macarrão, 4 de 30 ovos, 100 g de 150 g de parmesão, 200 g de bacon de peru: tudo bate com as ferramentas) |
| `mediou_sem_decidir` | 0.00 | **1.00** (*"Confirmam a substituição do bacon por bacon/peito de peru, ou preferem a versão vegetariana?"*) |
| `falta_virou_trade_off` | 0.00 (faltantes identificados, nada foi pra lista) | **1.00** (bacon e pimenta foram para `registrar_lista_compras` com substituto sem porco) |

**Fala:** *"Mesmo pedido. Mesmo produto. Mesmo dia. De manhã ele não entregou
nada; à tarde ele mediou, com número de ferramenta e deixando a escolha com o
casal. Se eu tivesse testado de manhã, diria que o produto está quebrado. Se
tivesse testado à tarde, diria que está pronto. Os dois estariam errados —
produto é o que acontece nos outros dias."*

### Os dois relatos de ingestão

| Trace | Pedido | `execucao_integra` | `tipo_correto` | `sem_invencao_numerica` | `ancoragem_no_texto` |
|---|---|---|---|---|---|
| `fc52a27f08c7` · 29/08 20:10 | *"comprei 1 vinho tinto tannat - 1 chocolate 60% dark hershey's - 2 pães franceses"* | 1.00 | **0.00** | 1.00 | **0.40** |
| `724d2cf3a53e` · 29/08 18:59 | *"comemos a lasagna, num total de 3 porções nós dois"* | 1.00 | 1.00 | 1.00 | 1.00 |

⚠️ **O trace do vinho oscila entre rodadas.** Em três execuções de 03/09:
1ª) `tipo_correto 0.00` + `ancoragem 0.40`; 2ª) `sem_invencao_numerica 0.00`
(*"item_unidade='garrafa'"* não foi dito) + `ancoragem 0.40`; 3ª) só
`ancoragem 0.40`. O que é estável e o que a fala deve usar:
**`ancoragem_no_texto 0.40`, sempre com a mesma razão — três itens comprados,
um registrado.** Não prometer na fala nenhum outro critério reprovado; ler o
que vier na tela. Se quiser, é conteúdo: *"o juiz também é um modelo; por isso
a justificativa importa mais que a nota."* O par do Mediador e o risoto, ao
contrário, repetiram as mesmas notas em todas as rodadas.

Justificativas que valem leitura:

- `ancoragem_no_texto 0.40` (vinho): *"a mensagem descreve três itens
  comprados (vinho, chocolate, pães), mas os campos só contemplam o vinho,
  silenciando totalmente os outros dois."* Uma compra de três itens virou uma
  compra de um — e ninguém recebeu erro.
- `ancoragem_no_texto 1.00` (lasanha): *"o nome foi normalizado de 'lasagna'
  para 'lasanha', normalização ortográfica aceitável"* — o juiz aprovou; o
  que aconteceu **depois** (o casamento de nome em código que não bateu) não
  é assunto de eval, é da Aula 3. Não entregar isso aqui.

### Alternativa liberada pelo Diego (círculo 0): incluir a operação antiga

```bash
node evals/run-evals.js --dry-run --trace 652b38032d3ce3953b4758e607c40223,d807057bd0808ca94dc63c8a0970f328,c4362988d8e22921305a6059ca866844,57debf7a71533fdc6a9e7a982595ba7c,fc52a27f08c7cd11be8e0894d1e34ccf,724d2cf3a53efbfa29ad53fde19a3cda
```

Acrescenta o par 13:53 / 13:55 de 12/08 em `sugerir-receita` (mesmo pedido,
dois minutos): 13:53 passou em `execucao_integra`, `respeito_as_restricoes` e
`consumo_registrado` com `fidelidade_ao_estoque 0.40` (*"cita tomate, cebola e
azeite, que não aparecem em `consultar_estoque`"*); 13:55 zerou tudo (teto de
1024, saída vazia, observação em ERROR). São ~1 min 30 s de tela. Só usar se
o par do Mediador não bastar — ele basta.

---

## Se der ruim (previsto)

**Um trace falha no meio da rodada** (aconteceu num pré-flight de 03/09):

```
[1/2] 1ecca5e617e2...  FALHOU
  Error: O juiz nao devolveu o criterio "execucao_integra"
```

Não cortar. É o juiz falhando, o script não engoliu, e `tool_choice` forçado
garante a *chamada* da ferramenta, não que todo campo venha preenchido.
Rodar de novo o mesmo comando.

**Rodada toda 1.00:** impossível com estes traces pinados (o par tem um zero
garantido). Se acontecer, o id está errado.

**Langfuse desligado:** *"Faltam variaveis de ambiente: LANGFUSE_..."* →
`.\scripts\observabilidade.ps1 on`.

**Sem rede / sem API:** as tabelas acima são o fallback. Mostrar este arquivo.

---

## Depois do REC

```bash
.\scripts\observabilidade.ps1 off
```

A Aula 3 precisa do contraste ligado/desligado no 3.2.

---

## Inventário de traces (03/09, 19h UTC)

| Operação | Traces | Observação |
|---|---|---|
| `mediar-cardapio` | 13 | 2 de hoje (testes de carbonara), 8 de 22/08, 3 de 13/08. Só **um** chegou inteiro: `652b38032d3c`. |
| `sugerir-receita` | 3 | todos de 12/08, 13:52 a 13:55. Operação fora da UI desde a v4; não cresce sozinha. |
| `ingerir-relato` | 29 | de 05/08 a 29/08. |

**Três relatos de ingestão que o juiz aprovou em tudo** (julgados em 03/09,
todos 1.00 nos quatro critérios) — úteis como exemplo de "caso de fronteira"
no 2.2, não como demo: `2741202475247246279cd6ebd3a3cf02` (*"comprei 1,2kg de
tomate carmem, R$9,30/kg"* — o juiz aceitou `custo=11.16`, uma multiplicação
feita pelo modelo, como "não é estimativa"); `d41f184dd2453d92ac131554c653cd70`
(*"4 porções de 250g e uma extra"* → `item_quantidade=5`, soma feita pelo
modelo, aceita como "fronteira aceitável"); `41a4e5c75e3331cad95e7ffe8ba9932d`
(*"3 porções, 1 e 1/2 para cada"*). Os dois primeiros são exatamente o caso
que `criterios.md` chama de aritmética na LLM — **o critério diz uma coisa e o
juiz foi leniente**. Vale uma frase no 2.3: quem escreve o critério também
precisa ler o que o juiz faz com ele.

Outros traces julgados hoje, para referência: `efae9192` (pizza napoletana,
22/08 17:07) e `229e64e8` (carbonara, 13/08 23:34), ambos truncados com
`numeros_de_tool 1.00` e o resto 0. `1ecca5e617e2` (hoje 19:36) zerou os
cinco com a saída *"Consultei"*.
