# Aula 3 — dados congelados (16/09/2026, 14h54 BRT)

Todo número de [`aula3-script.md`](../aula3-script.md) sai daqui. Nada foi
estimado: as contas foram feitas em código, por
[`scripts/aula3-retrato-langfuse.js`](../../scripts/aula3-retrato-langfuse.js)
(só leitura, só `GET` na API pública do Langfuse). O extrato das interações
que vão sair da janela está em
[`traces-preservados/aula3-mediacoes-e-erros-16-09.json`](./traces-preservados/aula3-mediacoes-e-erros-16-09.json).

**Revalidar perto da gravação** (o painel muda todo dia):

```powershell
node scripts/aula3-retrato-langfuse.js
```

Horários em **BRT**. O Langfuse mostra a hora do navegador; o servidor do
produto roda em UTC (UTC = BRT + 3h).

---

## ⚠️ O calendário manda nesta aula

O plano Hobby dá **30 dias de acesso** ao dado. Metade da janela de hoje é de
um único período (21/08 à noite e 22/08), então ela sai quase toda de uma vez:

| Se abrir o painel em | Interações | Custo na tela | Mediações | Mediador na conta | Interações com nota |
|---|---|---|---|---|---|
| 17/09 a 20/09 | 42 | US$ 1,54 | 10 | 89,6% | 6 |
| **21/09** | 22 | US$ 0,47 | 2 | 76,4% | 2 |
| **22/09** | 21 | US$ 0,46 | 2 | 76,9% | 1 |
| 23/09 em diante | 20 | US$ 0,46 | 2 | 77,4% | 0 |

A projeção supõe que nada novo entre. A próxima receita premium sai sexta,
18/09, por volta das 7h20: +1 interação, cerca de US$ 0,02.

**Consequências diretas:**

- Gravando **até domingo, 20/09**, o painel ao vivo bate com os slides.
- Gravando **a partir de 21/09**, 8 das 10 mediações, o episódio da lasanha e
  todas as interações com nota somem da tela. O script já traz os números
  congelados nos slides; a diferença vira o próprio conteúdo do slide de
  retenção (3.3).
- As **39 notas** foram escritas em 28/08. Elas continuam listadas até ~27/09,
  mas as interações a que pertencem saem antes (6 das 9 ainda estão na janela
  hoje; 0 a partir de 23/09).
- Os traces de **03/09** (duas mediações, incluindo `1ecca5e6`, o fio condutor
  3.2 → 3.4) ficam visíveis até ~02/10. Os de **28/08** (a sexta da chave
  inválida), até ~27/09.

---

## 1. A janela visível hoje

- **42 interações**, de 21/08 21h20 a 14/09 18h18
- **US$ 1,54** de custo acumulado
- **259 registros** visíveis (42 interações + 178 passos + 39 notas): 0,5% das
  50 mil unidades/mês do plano gratuito

| Operação | n | % das chamadas | custo médio | % da conta | latência média | p50 | p95 | pior |
|---|---|---|---|---|---|---|---|---|
| `mediar-cardapio` | 10 | 23,8% | US$ 0,1381 | **89,6%** | 55,9 s | 49,5 s | 91,1 s | 113,0 s |
| `receita-premium-semanal` | 6 | 14,3% | US$ 0,0115 | 4,5% | 7,3 s | 8,5 s | 11,0 s | 11,1 s |
| `ingerir-relato` | 21 | **50,0%** | US$ 0,0031 | 4,3% | 1,5 s | 1,2 s | 2,8 s | 3,3 s |
| `ingerir-nota-imagem` | 2 | 4,8% | US$ 0,0071 | 0,9% | 3,3 s | 3,3 s | 3,9 s | 4,0 s |
| `ingerir-nota-fiscal` | 2 | 4,8% | US$ 0,0054 | 0,7% | 2,7 s | 2,7 s | 3,4 s | 3,4 s |
| `teste-ingestao` | 1 | 2,4% | US$ 0,0000 | 0,0% | — | — | — | — |

Com 10 mediações, o "p95" é praticamente o pior caso. **Com amostra pequena,
fale do pior caso, não de percentil.**

Mudou desde o ensaio de 14/09 (38 interações, US$ 1,53, "26% / 90%"): entraram
as 4 mensagens do hambúrguer (14/09 à noite). Agora é **24% / 90%**.

## 2. Passos por interação (o tamanho da árvore)

- `ingerir-relato`: **2** passos (1 agente + 1 chamada ao modelo)
- `mediar-cardapio`: **10, 12 ou 15** passos. `1ecca5e6` tem **12** (1 agente,
  4 chamadas ao modelo, 7 ferramentas)
- `receita-premium-semanal`: 2 passos (1 quando dá erro antes do modelo)

## 3. Volume por dia (BRT)

| Dia | Interações | Custo | O que aconteceu |
|---|---|---|---|
| 21/08 | 13 | US$ 0,61 | 5 mediações (21h20–22h16), 5 relatos, 2 notas fiscais, 1 receita premium |
| 22/08 | 8 | US$ 0,47 | 3 mediações, 4 relatos (inclui a lasanha, 11h38), 1 teste — **dia da aula ao vivo** |
| 24/08 | 1 | US$ 0,00 | 1 relato |
| 28/08 | 3 | US$ 0,02 | 3 tentativas da receita premium (ver §6) |
| 29/08 | 8 | US$ 0,04 | 6 relatos, 2 notas por foto |
| 03/09 | 2 | US$ 0,36 | 2 mediações (testes de carbonara, preparação da Aula 2) |
| 04/09 | 1 | US$ 0,02 | receita premium, 7h18 |
| 11/09 | 1 | US$ 0,02 | receita premium, 7h18 |
| 13/09 | 1 | US$ 0,00 | 1 relato |
| 14/09 | 4 | US$ 0,01 | 4 mensagens do hambúrguer (18h17–18h18) |

- **21 das 42** interações caíram entre 21/08 21h20 e 22/08 16h40: menos de
  20 horas. O pico coincide com a aula ao vivo de 22/08 e a noite anterior.
  *(A confirmar com o Diego: foi preparação dele?)*
- Dias sem nenhuma interação: 23/08, 25–27/08, 30/08–02/09, 05–10/09, 12/09,
  15–16/09.
- **28/08 de manhã o produto estava fora do ar** (fim do período gratuito do
  Railway; voltou às 10h34, segundo `PLANO-GRAVACAO-CURSO.md`). Fora do ar não
  gera rastro nenhum. *O intervalo de 24/08 a 28/08 é ambíguo: sem uso ou
  fora do ar? O Langfuse não tem como dizer. Não afirmar nenhum dos dois.*

## 4. Vermelho no painel — as 6 interações com nível ERROR

| Quando | Operação | Mensagem | Trace |
|---|---|---|---|
| 21/08 21h20 | `mediar-cardapio` | `400 invalid_request_error: tool_use ids were found without tool_result blocks` | `cd1e4129dd4a` |
| 21/08 21h25 | `mediar-cardapio` | idem | `eb57c85182f2` |
| 21/08 22h16 | `mediar-cardapio` | idem | `4a6df619b6bc` |
| 28/08 11h35 | `receita-premium-semanal` | `401 authentication_error: API key is invalid.` | `461cc85b29e1` |
| 28/08 12h35 | `receita-premium-semanal` | idem | `463d682c0f84` |
| 29/08 16h21 | `ingerir-nota-imagem` | "Li a chave (35260761…6101) e ela é válida, mas a SEFAZ de SP não abre a nota só com a chave — ela exige o QR code. Manda outra foto com o QR nítido…" | `55b8ca336f50` |

A última **não é falha do produto**: é o produto explicando ao usuário o que
faltava (e é o registro real do dia em que o desenho "visão lê a chave" caiu,
contado na Aula 4). Mas conta como erro no painel: **infla a taxa de erro**.
Mesmo tipo de achado do QA de 12/09, item 4 (erro de usuário respondido como
500).

## 5. O padrão do Mediador — as 10 mediações

### 5.1 Uma por uma

| Quando | Trace | Painel | O que apareceu na tela | Fim do texto | Custo | Latência |
|---|---|---|---|---|---|---|
| 21/08 21h20 | `cd1e4129` | 🔴 | ⚠️ Erro na mediação: 400… | — | US$ 0,1005 | 41,5 s |
| 21/08 21h25 | `eb57c851` | 🔴 | ⚠️ Erro na mediação: 400… | — | US$ 0,0982 | 39,7 s |
| 21/08 21h25 | `ec907b77` | ⚪ | "(proposta registrada sem texto)" | (vazio) | US$ 0,1080 | 43,7 s |
| 21/08 21h25 | `9f8bb3c5` | ⚪ | texto cortado | "…(nenhum delivery/restaur" | US$ 0,1517 | 52,0 s |
| 21/08 22h16 | `4a6df619` | 🔴 | ⚠️ Erro na mediação: 400… | — | US$ 0,1070 | 41,7 s |
| 22/08 08h16 | `d807057b` | ⚪ | "(proposta registrada sem texto)" | (vazio) | US$ 0,1587 | 61,3 s |
| 22/08 13h01 | `652b3803` | ⚪ | **mediação inteira** | "…ou preferem a versão vegetariana?" | US$ 0,1899 | **113,0 s** |
| 22/08 14h07 | `efae9192` | ⚪ | texto cortado | "…(molho, mussarela de búfala" | US$ 0,1101 | 47,0 s |
| 03/09 16h34 | `5e9799ea` | ⚪ | texto cortado | "…- Ovos brancos" | US$ 0,1785 | 64,4 s |
| 03/09 16h36 | `1ecca5e6` | ⚪ | **uma palavra** | "Consultei" | US$ 0,1780 | 54,9 s |

**Resumo:** 3 vermelho (erro), 7 sem alarme, **1 inteira**. O Langfuse só pinta
vermelho pra ERROR — não existe "verde"; o resto do painel fica sem cor
(⚪ aqui é notação nossa, não do produto).

Três delas o aluno já viu na Aula 2, uma de cada vez: o risoto (`9f8bb3c5`,
demo do 2.3) e o par da carbonara (`d807057b` de manhã × `652b3803` à tarde,
demo do 2.4). `5e9799ea` ("Ovos brancos") era a demo alternativa do 2.3.

A inteira (`652b3803`) rodou na **máquina local**; as outras nove, em
produção. Não há evidência de que isso explique a diferença. **Não afirmar.**

### 5.2 O que a tela mostra, conferido no código

- Resposta com texto: `🍳 Mediador:` + o texto (`public/app.js:339`).
- **Texto vazio: a tela escreve "(proposta registrada sem texto)"** (mesma
  linha, é o fallback do front).
- Erro: `⚠️ Erro na mediação:` + a mensagem crua da API (`public/app.js:342`).
- O texto mostrado é o texto da última resposta do modelo que tinha texto
  (`agent.js`, `finalText`), e é exatamente o que o trace grava como saída.

### 5.3 E a proposta, foi mesmo registrada? (Supabase, `trade_off_decisions`, lido em 16/09)

| Mediação | Proposta gravada |
|---|---|
| `ec907b77` (tela: "proposta registrada sem texto") | **`{}` — vazia** |
| `d807057b` (tela: "proposta registrada sem texto") | **`{}` — vazia** |
| `efae9192` (texto cortado) | `{}` — vazia |
| `5e9799ea` (texto cortado) | `{}` — vazia |
| `9f8bb3c5` (texto cortado) | proposta com opções, contexto e achados |
| `1ecca5e6` ("Consultei") | proposta completa (opções, validade, orçamento…) |
| `652b3803` (inteira) | proposta completa + escolha |
| as 3 com erro | nenhuma linha (o erro acontece antes do insert) |

**A tela disse "proposta registrada" duas vezes em que nada foi registrado.**
E em `1ecca5e6` o contrário: a proposta inteira foi pro banco, e a tela
mostrou uma palavra.

### 5.4 A assinatura: tokens de saída iguais ao teto

| Operação / chamada | No teto | Maior saída |
|---|---|---|
| `mediar-cardapio` / `chamada-claude` (teto 2.048) | **9 de 30** | 2.048 |
| `mediar-cardapio` / `forcar-registro-decisao` (teto 1.024) | **6 de 6** | 1.024 |
| `ingerir-relato` / `classificar-intencao` (teto 1.024) | 0 de 21 | 547 |
| `receita-premium-semanal` / `escolher-video` (teto 2.048) | 0 de 4 | 621 |
| notas fiscais (teto 2.048) | 0 de 4 | 371 |

- **9 das 10 mediações** têm pelo menos uma chamada no teto. A única que não
  tem é a inteira.
- Os **três dias** com mediação (21/08, 22/08, 03/09) tiveram mediação no teto.
- Nas 3 vermelhas, a chamada no teto terminou no meio de uma chamada de
  ferramenta (a última com o input cortado em `{}`). O loop não processou
  essas chamadas, e a requisição seguinte caiu com o 400 do `tool_use` órfão:
  **a mesma cadeia do achado §11.4 do SDD**, agora no Mediador.
- Nas sem-alarme cortadas, a chamada no teto traz um bloco `thinking` e depois o
  texto, que para no meio. O **conteúdo** do bloco `thinking` não fica gravado
  (vem vazio no trace). Então **não dá pra afirmar quanto do orçamento o
  raciocínio consumiu**, só que o texto visível encolhe: 1.737 → 782 → 246 →
  9 caracteres. *Hipótese pra Aula 4, não afirmação da Aula 3.*

### 5.5 Quanto custou

| Desfecho | Custo |
|---|---|
| erro (3) | US$ 0,3057 |
| vazia (2) | US$ 0,2667 |
| cortada (3) | US$ 0,4403 |
| uma palavra (1) | US$ 0,1780 |
| **inteira (1)** | US$ 0,1899 |

**Mediações que não chegaram inteiras: US$ 1,1907.** São 86,2% do custo do
Mediador e **77,3% da conta do produto inteiro**.

### 5.6 A mais lenta foi a única inteira

`652b3803`: 113,0 s, 5 chamadas ao modelo, nenhuma no teto. As cortadas
ficaram entre 40 e 64 s. **Com 10 casos, isso é pista, não lei.** Mas é o
bastante para dizer que otimizar pela média teria premiado as cortadas.

## 6. A sexta-feira da chave inválida (28/08)

O job da receita premium roda **toda sexta**, checando de hora em hora a
partir das 10h **do relógio do servidor, que é UTC** (7h em Brasília):
`receita-premium.js`, `DIA_PREMIUM = 5`, `HORA_PREMIUM = 10`, `setInterval`
de 1h.

| Quando (BRT) | O que aconteceu | Fonte |
|---|---|---|
| 04/09 e 11/09, 7h18 | ✅ receita escolhida (sextas normais) | traces `ae84dc63`, `2091a12e` |
| 28/08, manhã até 10h34 | produto fora do ar: **nenhum rastro** | `PLANO-GRAVACAO-CURSO.md` |
| 28/08, 11h35 | ❌ `401 API key is invalid` (0,9 s) | trace `461cc85b` |
| 28/08, 12h35 | ❌ `401 API key is invalid` (4,1 s) | trace `463d682c` |
| 28/08, 12h54 | chave da Anthropic substituída (estava revogada desde ~24/08) | `PLANO-GRAVACAO-CURSO.md` |
| 28/08, 13h55 | ✅ Beef Wellington (10,7 s, US$ 0,018) | trace `46bdbeae` |

Dois detalhes batem de forma independente com o relato do plano: as
tentativas de 11h35 e 12h35 caem exatamente 1h e 2h depois de o servidor voltar
(10h35), e o sucesso das 13h55 cai 1h depois do redeploy com a chave nova.

Liga com a Aula 2.5: "saiu no prazo?" e "pulou alguma semana?" foram
**recusadas como eval** (conta de data, não julgamento) e registradas como
**pendência de observabilidade**. A resposta mora aqui: nas sextas normais a
receita sai às 7h18; nessa saiu às 13h55, depois de dois erros.

Esta é também **a primeira vez** que aparece o **Beef Wellington**: escolhido
de novo na sexta seguinte (04/09), é a repetição que o eval da Aula 2.5 pegou
com nota 0,15.

## 7. Notas (Scores)

- **39 notas** em **9 interações**, todas escritas em **28/08** (uma rodada só
  do pipeline da Aula 2)
- 6 dessas 9 interações ainda estão na janela; 3 (`e803a194`, `c4362988`,
  `57debf7a`) já saíram
- A Aula 2.5 rodou em `--dry-run`: **não gravou nota**
- **Não existe série no tempo.** "Qualidade ao longo do tempo", hoje, é um
  ponto só.

## 8. A comparação de modelos (anotada em 22/08, fora do painel hoje)

De `aula4-inventario-conteudo.md` §2. É a mesma tarefa (`ingerir-relato`),
com o mesmo prompt e a mesma tool forçada:

| Modelo | n | Custo médio | Latência média |
|---|---|---|---|
| `claude-haiku-4-5` | 6 | US$ 0,00293 | 1,17 s |
| `claude-sonnet-5` | 24 | US$ 0,00563 | 2,99 s |

Haiku: **1,9× mais barato e 2,5× mais rápido**. Hoje as 21 interações de
ingestão na janela são todas haiku. **Esse número só existe porque foi
anotado.**

## 9. Afirmações da demo do 3.2, testadas em 16/09

**Sem as chaves, o SDK avisa sim**, e só uma vez, na subida. Teste local, sem
banco e sem modelo:

```
[Langfuse SDK] [WARN] No exporter configured and no public key provided in constructor or as LANGFUSE_PUBLIC_KEY env var. Span exports will fail.
[Langfuse SDK] [WARN] No exporter configured and no secret key provided in constructor or as LANGFUSE_SECRET_KEY env var. Span exports will fail.
```

O `trace_id` continua sendo gerado normalmente. O envio falha com
`Unauthorized`, sem mensagem extra durante o teste.

➡️ **A frase "nada avisa" do ensaio de 14/09 não se sustenta.** A versão
honesta: *o aviso existe, duas linhas amarelas na hora de ligar, num terminal
que em produção ninguém abre.* **Conferir ao vivo, antes de gravar**, se
aparece mais alguma linha a cada mensagem enviada com a observabilidade
desligada.

**A troca de modelo na gaveta de Configurações fica só na memória do servidor
local** (`currentConfig` em `server.js`): não afeta produção.

## 10. Fatos do Langfuse citados na aula (fonte oficial, lida em 16/09)

| Fato | Fonte |
|---|---|
| Hobby: gratuito, **50 mil unidades/mês**, **30 dias de acesso ao dado**, 2 usuários | [langfuse.com/pricing](https://langfuse.com/pricing) |
| Unidade = qualquer registro enviado: interação (trace), passo (observation) ou nota (score) | idem |
| Core: US$ 29/mês, 90 dias · Pro: US$ 199/mês, 3 anos | idem |
| Docker Compose: "single VM without high availability, scaling, or backups" | [langfuse.com/self-hosting](https://langfuse.com/self-hosting) |
| Painel inicial (Home): interações no tempo, custo por modelo, **latência p50/p90/p95/p99**, notas, uso por modelo | [docs de dashboards](https://langfuse.com/docs/metrics/features/custom-dashboards) |
| Lag de ~45 s entre o envio e o registro ficar consultável | SDD §11.2 (medido no projeto) |

Os **rótulos de menu** mudam entre versões do Langfuse. Confirmar na tela
antes de gravar e escrever no texto de apoio com o nome exato.

## 11. Estado do produto em 16/09 (pré-flight)

| Item | Estado |
|---|---|
| Produção | **401** ✅ |
| Observabilidade no `.env` local | **LIGADA** (3 variáveis) |
| Lasanha (episódio C) | **5/5** porções, intacta |
| Lista de compras pendente | bacon de peru, pimenta do reino, fubá (nada de tomate ou cebola) |
| Nome do projeto no Langfuse | ainda "Chef Caseiro" (aparece na tela) |
