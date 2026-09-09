# Plano de gravação — curso completo (29/08)

Mapa mestre das 5 aulas. Cada entrada abaixo corresponde a uma linha do CSV
oficial (`Curso Alura - Montagem do Curso (3).csv`) — título, tempo e
objetivo de aprendizagem são copiados dali, não reinventados. Este documento
não substitui os roteiros por aula; ele aponta pra eles e fixa **qual
versão do produto usar em cada vídeo**, pra nunca ter que decidir isso ao
vivo.

Convenção de comando: cada bloco `bash` é **um** comando, na ordem em que
deve rodar. "Sem comando" significa vídeo sem demo de terminal.

> ✅ **Estado ao fim de 28/08 — tudo verificado e funcionando.** Foi um dia
> de dois sustos, os dois resolvidos:
>
> - Produção caiu de manhã (fim do período gratuito do Railway; a URL
>   devolvia 404) e **voltou às 10h34**.
> - A `ANTHROPIC_API_KEY` estava revogada, o que tinha derrubado **toda**
>   chamada de modelo desde ~24/08. Substituída às 12h54. A conta emite
>   chaves *identity-linked*, então agora também é obrigatória a variável
>   `ANTHROPIC_WORKSPACE_ID` — ela está no `.env` **e** no Railway.
>
> Verificado depois do redeploy: produção responde **401** do Basic Auth,
> `/api/estado-cozinha` devolve dados reais, o webhook do Telegram está sem
> erro pendente, e o pipeline de evals rodou de verdade gravando **39
> Scores** no Langfuse.
>
> Antes de gravar, reconfirme só isto — **401 é bom, 404 é problema**:
>
> ```bash
> curl.exe -s -o NUL -w "HTTP %{http_code}\n" https://chef.workshopee.com.br
> ```
>
> O pre-flight do runbook §1 (esperar o hash `b876e2c`) **está
> desatualizado** — veja o comando correto no
> [setup](./SETUP-MAQUINA-ESCOLA.md), passo 5.

## Tabela-resumo: aula → versão do produto

| Aula | Versão / branch | Onde roda |
|---|---|---|
| 1 — O produto lançou. E agora? | `master` (produção) | https://chef.workshopee.com.br |
| 2 — Evals | `aula2/pipeline-evals` | local (`railway run npm start` ou `.env` próprio) |
| 3 — Observabilidade | `master` + Langfuse Cloud | produção (dados reais) + local (antes/depois sem/com `LANGFUSE_*`) |
| 4 — Detectar, diagnosticar, corrigir | `master` → `aula4/fix-diagnostico-telegram` → `aula4/nota-por-foto` | produção (deploy ao vivo, Railway) |
| 5 — Guardrails, transparência, LGPD | `master` | tour de código, sem deploy |

Detalhe operacional completo da Aula 4 (a única com deploy ao vivo e ordem
de branches que importa): **não está repetido aqui** — está inteiro em
[`docs/RUNBOOK-gravacao-29-08.md`](./RUNBOOK-gravacao-29-08.md) e em
[`docs/aula4-roteiro-falha-telegram.md`](./aula4-roteiro-falha-telegram.md).
Abra os dois antes de gravar a Aula 4.

## Aula 1 — O produto lançou. E agora?

Versão: **`master`, produção** (https://chef.workshopee.com.br, Basic Auth
— senha em `railway variable list`, ver `docs/SETUP-MAQUINA-ESCOLA.md`).
Roteiro detalhado: [`docs/aula1-roteiro.md`](./aula1-roteiro.md).

| # | Título | Tempo | Objetivo de aprendizagem |
|---|---|---|---|
| 1.1 | Apresentação | 3 min | Fazer uma apresentação própria + audiodescrição |
| 1.2 | Lançar é o começo | 5 min | Entender por que o lançamento é o início de um ciclo contínuo de operação, não o fim do trabalho |
| 1.3 | Os três pilares da operação | 5 min | Conhecer evals, observabilidade e conformidade responsável como os três pilares de uma operação saudável |
| 1.4 | Mapeando riscos do produto | 5 min | Aplicar um mapeamento inicial de riscos operacionais no Chef Caseiro, identificando onde as coisas podem dar errado |
| 1.5 | O que aprendemos? | 3 min | (Explicação — texto no fim da aula, não vídeo) |

Comandos: nenhum (aula é tour visual de produção + slides).

Slides: deck "Aula 1" (introdução + 3 pilares + matriz de riscos).

## Aula 2 — Evals: avaliando a qualidade das respostas

Versão: **`master`** — `evals/run-evals.js` e `evals/criterios.md` foram
construídos e testados em 28/08 contra os traces reais de produção, e estão
em `master`. **Sem checkout nesta aula** (a branch `aula2/pipeline-evals`
existe com o mesmo conteúdo, se você preferir). Roteiro detalhado:
[`docs/aula2-roteiro.md`](./aula2-roteiro.md).

| # | Título | Tempo | Objetivo de aprendizagem |
|---|---|---|---|
| 2.1 | O que são evals? | 10 min | Compreender o conceito de evals e por que são essenciais pra garantir qualidade de forma contínua |
| 2.2 | Critérios de qualidade | 12 min | Criar critérios claros e mensuráveis pra avaliar respostas, em linguagem acessível, sem código |
| 2.3 | Claude como avaliador | 12 min | Usar o Claude como avaliador sistemático, com prompts estruturados que simulam julgamento humano |
| 2.4 | Primeiro conjunto de evals | 15 min | Montar o primeiro conjunto de evals cobrindo os cenários mais críticos e os erros mais custosos |
| 2.5 | O que aprendemos? | — | (Explicação) |

Comandos:

```bash
git checkout aula2/pipeline-evals
```

```bash
node evals/run-evals.js
```

Slides: deck "Aula 2" (o que são evals, critérios com exemplos do Chef
Caseiro, Claude-as-judge com `tool_choice`, resultado do primeiro rodada).

## Aula 3 — Observabilidade: monitorando em produção

Versão: **`master` + Langfuse Cloud** (dados reais de produção). O momento
"antes/depois" do 3.1/3.2 roda **local**, primeiro sem e depois com as
variáveis `LANGFUSE_*` no `.env`. Roteiro detalhado:
[`docs/aula3-roteiro.md`](./aula3-roteiro.md).

| # | Título | Tempo | Objetivo de aprendizagem |
|---|---|---|---|
| 3.1 | O que é observabilidade? | — | Entender o que significa observar um produto com IA em produção: quais dados capturar, o que revelam, por que isso muda a operação |
| 3.2 | Conhecendo o Langfuse | — | Navegar pela interface do Langfuse, entender sua estrutura de dados e configurá-lo no Chef Caseiro |
| 3.3 | Lendo os dados de produção | — | Interpretar volume de uso, latência, erros e variações de qualidade ao longo do tempo |
| 3.4 | Padrões de falha | — | Identificar padrões recorrentes de falha e degradação, usando o Langfuse para achar onde e quando o produto piora |
| 3.5 | O que aprendemos? | — | (Explicação) |

(Tempos não informados no CSV para a Aula 3.)

Comandos (script de apoio testado em 28/08 — guarda e devolve só as três
variáveis `LANGFUSE_*`, sem tocar nas do Supabase/Anthropic):

```bash
powershell -File scripts/observabilidade.ps1 off
```

```bash
npm start
```

```bash
powershell -File scripts/observabilidade.ps1 on
```

Se a máquina ainda não tiver `.env` (é o caso da escola, que roda via
`railway run`), gere antes com `powershell -File
scripts/observabilidade.ps1 preparar`.

Slides: deck "Aula 3" (o que observar, tour do Langfuse, tabela de custo/
latência do RUNBOOK §3, os 4 padrões de falha do SDD §11).

## Aula 4 — Detectar, diagnosticar e corrigir

Versão: **exatamente a sequência do `docs/RUNBOOK-gravacao-29-08.md`** —
`master` (quebrado de propósito) → `aula4/fix-diagnostico-telegram` (PR #4)
→ `aula4/nota-por-foto` (PR #6). **Não reescrito aqui** — os comandos, a
ordem dos atos e as três falhas reais (episódios A/B/C) estão no runbook e
no roteiro de falha do Telegram. Abra os dois lado a lado:

- [`docs/RUNBOOK-gravacao-29-08.md`](./RUNBOOK-gravacao-29-08.md) — estado,
  sequência dos 5 atos, comandos de deploy.
- [`docs/aula4-roteiro-falha-telegram.md`](./aula4-roteiro-falha-telegram.md) —
  roteiro detalhado dos episódios A e B (falha de canal).
- [`docs/aula4-inventario-conteudo.md`](./aula4-inventario-conteudo.md) —
  inventário completo (episódio C, números de custo, achados do SDD §11).

| # | Título | Tempo | Objetivo de aprendizagem |
|---|---|---|---|
| 4.1 | Detectando degradação | — | Reconhecer sinais de degradação de qualidade nos dados do Langfuse, diferenciando variação normal de problema real |
| 4.2 | Diagnosticando a causa | — | Usar evals com o Claude pra diagnosticar causa raiz — prompt, dados ou modelo |
| 4.3 | Corrigindo antes do usuário | — | Aplicar correções no produto antes que o usuário perceba, validando com o mesmo conjunto de evals do diagnóstico |
| 4.4 | Simulando o ciclo completo | — | Executar um ciclo simulado completo de detecção, diagnóstico e correção, consolidando o fluxo das aulas anteriores |
| 4.5 | O que aprendemos? | — | (Explicação) |

Mapeamento vídeo → ato do runbook (sugestão): 4.1 = Ato 1 (a falha) +
episódio C (custo/estado); 4.2 = Ato 2 (diagnóstico) + rodar evals da Aula 2
sobre as interações reais pra achatar "prompt vs dados vs modelo"; 4.3 = Ato
3 e Ato 4 (PR #4 e PR #6); 4.4 = Ato 5 + fechamento do ciclo, reforçando que
o episódio C (lasagna/lasanha) **fica sem correção** de propósito — gancho
pro checklist da Aula 5 (risco aceito e documentado, não escondido).

Slides: deck "Aula 4" — construir a partir das seções do runbook, não do
zero (RUNBOOK §2 e §3 já têm as tabelas/números prontos para slide).

## Aula 5 — Guardrails, transparência e LGPD

Versão: **`master`**, tour de código — sem deploy, sem checkout de branch.
Roteiro detalhado: [`docs/aula5-roteiro.md`](./aula5-roteiro.md). Checklist
de conformidade: [`docs/aula5-checklist-conformidade.md`](./aula5-checklist-conformidade.md).

| # | Título | Tempo | Objetivo de aprendizagem |
|---|---|---|---|
| 5.1 | O que são guardrails? | — | Entender guardrails em produtos com IA: limites operacionais que protegem usuários e a empresa |
| 5.2 | Transparência com o usuário | — | Aprender o que comunicar ao usuário sobre o uso de IA (quando, como, por quê), de forma clara e honesta |
| 5.3 | LGPD na prática | — | Identificar obrigações práticas da LGPD em produtos com IA: quais dados são coletados, como são usados, o que garantir ao usuário |
| 5.4 | Checklist de conformidade | — | (aponta para o checklist prático) |
| 5.5 | O que aprendemos? | — | (Explicação) |
| 5.6 | Conclusão | — | (fecha o curso amarrando os três pilares) |

Nota: a Aula 5 tem **6 vídeos**, não 4 — o CSV lista 5.1 a 5.6 (5.5 é a
explicação, 5.6 é um vídeo de conclusão extra). Único caso do curso com essa
estrutura; não é erro deste documento.

Comandos: nenhum (tour de código, sem terminal com efeito).

Slides: deck "Aula 5" (guardrails reais do código, resposta honesta do PR
#4, tabela LGPD, checklist, conclusão).

---

## Ordem do dia sugerida para 29/08

A ordem de **gravação** não precisa seguir a ordem do curso — ela segue o
que exige coordenação externa e o que é mais barato de regravar se der
errado:

1. **Aula 4 primeiro** — é a única com deploy real, ordem de branch que
   importa, e Telegram ao vivo (mais variáveis fora do seu controle: rede,
   Railway, delay do bot). Fazer com a cabeça mais fresca do dia.
2. **Aula 3 em seguida** — depende dos mesmos dados de produção que a Aula
   4 acabou de mexer; grave logo depois pra não deixar o estado do banco
   mudar entre uma e outra (o episódio C, por exemplo, só existe enquanto
   ninguém corrige o match lasagna/lasanha).
3. **Aula 2** — branch separada (`aula2/pipeline-evals`), sem dependência
   de produção; pode ser gravada em qualquer momento, mas fica mais fácil
   de narrar já tendo mostrado os dados reais da Aula 3.
4. **Aula 5** — tour de código, sem deploy; zero risco técnico, bom pra
   fechar o dia com energia mais baixa.
5. **Aula 1 por último** — é a mais "institucional" (apresentação,
   conceitos, mapa de riscos que planta sementes das aulas 3/4). Gravar por
   último com o conteúdo das outras aulas fresco na memória ajuda a plantar
   as sementes certas sem entregar o final.

Antes de tudo, rodar o checklist cronometrado de
[`docs/SETUP-MAQUINA-ESCOLA.md`](./SETUP-MAQUINA-ESCOLA.md) na máquina da
escola.
