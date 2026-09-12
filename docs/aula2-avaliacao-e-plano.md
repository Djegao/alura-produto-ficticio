# Aula 2 — avaliação do material e plano de reescrita (03/09)

Insumos: `Aula 1 6498.pptx` (28 slides, a referência de qualidade), `Aula 2
6498.pptx` (23 slides, incompleto), o espelho oficial (CSV), e os quatro
documentos de Aula 2 já em `docs/` (roteiro, backbone, leitura única, ensaio).

---

## 1. O que a Aula 1 faz certo — o padrão a copiar

| Padrão | Como aparece na Aula 1 |
|---|---|
| Ritmo | 28 slides para 18 min (~1,5 slide/min), 4 vídeos |
| Arco de cada vídeo | divisor azul → âncora cultural (citação) → conceito em uma frase por slide → build de no máximo 3 linhas → **claquete de demo** (`1.2.1 Demo Produto`, `1.4.2 Relatório`) |
| Texto | statements com ≤ 45 caracteres; listas com 3 itens; nada de parágrafo |
| Imagem | uma foto por bloco (foguete, yoga, corredor, Lean Startup), reaproveitada nos builds |
| Notas | **nenhuma** — a fala vive fora do deck |
| Âncoras | Reid Hoffman, tweet do Greg Brockman, frase própria do Diego, Lean Startup |
| Vocabulário | Musa Balance |

---

## 2. Avaliação do deck `Aula 2 6498.pptx`

| # | Problema | Onde | Efeito |
|---|---|---|---|
| 1 | **Cobertura**: só o 2.1 e a abertura do 2.2. Faltam 2.3, 2.4 e 2.5 inteiros | slides 20–23 | ~12 min de material para 49 min de espelho |
| 2 | Títulos divergem do espelho ("O que são evals **e o que é um bom critério**", "**Escolhendo** critérios") | 2, 20 | o espelho é o que vai pra plataforma |
| 3 | Build de abertura com **8 slides** para 9 linhas de nota; slides 10 e 11 são idênticos; a mesma nota colada em 13 slides | 4–11 | o dobro do build "Build and Run" da Aula 1 para o mesmo conteúdo |
| 4 | Cards de risco (5/5/6 = 16 riscos) em texto de ~11 pt, que somem no slide 7 sem serem citados | 5–6 | ilegível em vídeo; callback ao 1.4.2 sem função |
| 5 | Funil: **6 slides** do mesmo diagrama; a nota do 19 inverte a ordem (Cenário → **Resposta** → Critério); o backbone usa 3 passos | 13–19 | três versões do funil = ordem não decidida |
| 6 | "Não é QA, não é teste de software" entra na tela e não é explicado nela (a explicação só existe na leitura única) | 12 | afirmação solta |
| 7 | "Duas perguntas" do card ("o que eu esperaria ver / o que NÃO aceitaria") não aparecem em mais lugar nenhum; os 5 critérios chegam de uma vez sobre um cenário que **não está na tela**; "não decide sozinh**a**" vs Mediador | 19, 22 | aluno não sabe de onde os critérios vieram |
| 8 | Sem claquete de demo; "Bora pra prática?" não leva a nada | 21 | quebra o padrão da Aula 1 |
| 9 | Nenhuma âncora cultural. O tweet do Brockman (*"evals are surprisingly often all you need"*) já foi gasto na Aula 1 | — | 2.1 abre sem gancho externo |
| 10 | Notas só no bloco 4–19; daí em diante, nada | 20–23 | deck não presenta sozinho |

---

## 3. Avaliação do script por trás (`docs/`)

**Causa raiz do deck incompleto: a fonte está em movimento.** Existem quatro
versões concorrentes da Aula 2, todas de hoje ou de 28/08:

| Fonte | Slides | Funil | Critérios do Mediador | Vocabulário |
|---|---|---|---|---|
| `aula2-roteiro.md` (28/08) | outline | — | 3 (receita) | Chef Caseiro |
| `aula2-backbone.md` | 34 | 3 passos | 4 + 1 | Musa Balance |
| `aula2-leitura-unica.md` | 47 | 4 passos | 4 | Musa Balance |
| `evals/criterios.md` | — | — | **5** (`execucao_integra` + 4) | Chef Caseiro no título |

Montar slide em cima disso é montar em areia. Antes de qualquer slide, **um
documento mestre só**.

**O que é forte e fica** (já está escrito, só precisa de casa fixa):

- "Se eu mudar o produto amanhã, como vou saber?" → "Produto é o que acontece nos outros dias."
- Teste pergunta *é igual ao esperado?*; eval pergunta *é bom?* — e as duas versões podem estar certas.
- "Não estamos avaliando o modelo, e sim o comportamento esperado do produto."
- O cenário do pote vazio e do gato miando, e os critérios que nascem dele.
- As 4 partes do critério, com "por que erra caro" como filtro.
- "Se precisa de mim pra julgar, não é critério, é gosto."
- As 3 regras do juiz (só o material / evidência citável / severo com falha silenciosa).
- "O juiz não faz conta." · "Prompt não é contrato, prompt é pedido."
- O par 13:53 / 13:55 — mesmo pedido, dois minutos, um passa e o outro zera.
- "O que eu deliberadamente não medi."
- Fecho: "Eu sei o que procurar. Agora falta enxergar."

**O que é fraco no script, não só no deck:**

1. **2.1 são 10 min de aviso sem mostrar um eval.** O aluno só vê um
   resultado julgado no 2.3. A Aula 1 mostrou o produto antes de explicar os
   pilares; a Aula 2 deveria mostrar *um* eval antes de teorizar.
2. **Demos são terminal**, não produto na tela como na Aula 1. Funciona, mas
   precisa de claquete, fonte grande e fallback congelado.
3. **O momento mais forte (13:53/13:55) é em `sugerir-receita`**, o agente
   antigo do Chef Caseiro — justamente o vocabulário que a decisão de 03/09
   tirou da aula. E ele depende da ordem em que o Langfuse devolve os traces:
   `run-evals.js` não tem `--trace`, então qualquer uso novo do produto muda
   o que aparece na tela.
4. O objetivo do 2.3 no espelho é *"construindo prompts estruturados"*: as 3
   regras do juiz precisam estar **na tela**, não só na fala.
5. 47 slides com nota copiada em cada cópia do build é o que travou a
   montagem manual no slide 23.

---

## 4. Círculo 0 — decisões que destravam tudo (uma resposta sua)

> **Decidido pelo Diego em 03/09:** (1) a operação antiga pode aparecer;
> (2) funil de 4 passos; (3) títulos = espelho; (4) mestre único em
> `aula2-script.md`; (5) **sem citações, enxuto**; (6) primeira demo **só no
> 2.3**. Círculo 1 fechado em `apoio/aula2-demos-congeladas.md` — e o par
> 13:53/13:55 foi substituído por um par do próprio Mediador (22/08, 11:16 vs
> 16:01), então a decisão 1 deixou de ser necessária na prática.

1. **`sugerir-receita` pode aparecer** como "a operação antiga" para o momento
   13:53/13:55? Se não, preciso achar um par equivalente em `mediar-cardapio`
   (a confirmar nos 12 traces que existem).
2. **Funil de 4 passos** (Cenário → Critério → Resposta → Evidência).
   Recomendo 4; o de 3 colunas era limitação da base 21 da Aula 1.
3. **Títulos = espelho.** 2.1 "O que são evals?", 2.2 "Critérios de qualidade".
4. **Um mestre só**: `docs/aula2-script.md`. Backbone, leitura única e ensaio
   viram histórico (não apago, só param de ser editados).
5. **Âncora cultural do 2.1** — candidatos a confirmar fonte: Hamel Husain,
   *"Your AI product needs evals"* (2024); Lord Kelvin, sobre medir para
   conhecer; ou uma frase sua, como no slide 12 da Aula 1.
6. **Onde entra a primeira demo**: teaser de 15 s no fim do 2.1 (um eval
   julgado, sem explicar) ou só no 2.3.

---

## 5. Ordem de trabalho — um círculo por vez

> **Estado em 03/09, fim do dia: todos os círculos fechados.** Script mestre
> aprovado de ponta a ponta em `aula2-script.md` (formato Slide · Script, a
> pedido do Diego), 2.5 alinhado, deck inicial em
> `slides/Aula 2 6498 - inicial.pptx` (gerador em `slides/gerador-musa/`).
> Fica com o Diego: finalização no Google Slides.

| Círculo | Entrega | Aprovação = |
|---|---|---|
| **0** | As 6 decisões acima | sua resposta |
| **1 — demos primeiro** | Rodar os 3 comandos, congelar a saída real, **fixar os traces** (adicionar `--trace` ao `run-evals.js`, aditivo), escrever o fallback. Confirmar que o par 13:53/13:55 ainda é o que o `--limit 2` traz | saídas conferidas por você |
| **2 — 2.1** | Script em tabela `# · Tela (base da Aula 1 + texto) · Fala · Ação` | você lê e aprova |
| **3 — 2.2** | idem | idem |
| **4 — 2.3** | idem, em volta da saída congelada do círculo 1 | idem |
| **5 — 2.4** | idem, em volta do par 13:53/13:55 | idem |
| **6 — 2.5** | passada de vocabulário no texto que já existe | idem |
| **7 — pptx inicial** | Uma rodada só: duplico as bases do **seu** deck da Aula 1 (o de Downloads), preencho texto e nota, entrego o arquivo. Você finaliza no Google Slides | — |

**Por que demos antes das falas:** 2.3 e 2.4 são escritos em volta do que
aparece no terminal, e 2.1 planta o gancho do payoff do 2.4. Sem saída
congelada, cada fala em volta da demo é chute — e foi exatamente isso que
mudou três vezes hoje (média 0,27 → 0,56; 4 → 5 critérios).

**Por que 2.1 → 2.4 e não de trás pra frente:** você revisa na ordem em que
vai gravar; o payoff já está fixado pelo círculo 1, então não há risco de
escrever a abertura sem saber o final.

**Orçamento:** ~38 slides + 4 claquetes, dentro do ritmo da Aula 1.

---

## 6. Esqueleto para você reagir (antes de eu escrever fala nenhuma)

**2.1 — O que são evals? (10 min, ~9 slides)**
divisor → hero "Evals / O primeiro pilar do run" → âncora cultural → build
"E se eu mudar o produto amanhã?" (3 linhas) → statement "Testar uma vez
responde sobre aquele momento" → definição: teste pergunta *é igual?*, eval
pergunta *é bom?* → funil de 4 passos (1 slide limpo + 1 com os exemplos do
Mediador) → statement "Não estamos avaliando o modelo" → **claquete 2.1.1**
(teaser de um eval julgado, se decisão 6 = sim)

**2.2 — Critérios de qualidade (12 min, ~10 slides)**
divisor → statement "De opinião a critério verificável" → o cenário do gato
(lista de 3) → os critérios que nascem dele (2 slides: 3 + 2) → as 4 partes
do critério (3 colunas + statement "Por que erra caro") → binário ou 0 a 1 →
**claquete 2.2.1 Critérios** (ler `criterios.md` na tela) → fecho "Se
precisa de mim pra julgar, não é critério, é gosto"

**2.3 — Claude como avaliador (12 min, ~9 slides)**
divisor → "Ler à mão funciona — até não funcionar" → Trace → Julgamento →
Veredito (3 colunas) → **as 3 regras do juiz na tela** (o prompt) → "Nota
sem evidência não vale nada" → "O juiz não faz conta" → "Prompt não é
contrato" → **claquete 2.3.1** (o juiz julga uma mediação, 15 s) → leitura
das duas justificativas (0 em integridade, 1 em números de ferramenta)

**2.4 — Primeiro conjunto de evals (15 min, ~10 slides)**
divisor → "Conjunto é escolha, não lista" → "Antes de tudo: a execução
chegou inteira?" → o conjunto do Mediador (lista de 4) → "A falta nunca
cancela a proposta" → "O Mediador não está sozinho" → "O que eu
deliberadamente não medi" → **claquete 2.4.1** (o conjunto inteiro, ~1 min)
→ slide-tabela 13:53 / 13:55 → "Nota baixa é o conjunto funcionando" → "O
que ainda falta" → hero de fechamento "Eu sei o que procurar. Agora falta
enxergar."

**2.5 — O que aprendemos?** texto, já existe em `aula2-o-que-aprendemos.md`.
