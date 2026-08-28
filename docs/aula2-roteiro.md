# Aula 2 — Evals: avaliando a qualidade das respostas

Versão do produto: **`master`** — o pipeline (`evals/run-evals.js` +
`evals/criterios.md`) foi construído e testado em 28/08 contra os traces
reais, e está em `master`. **Não precisa de checkout nenhum nesta aula**;
isso é de propósito, pra que os roteiros não sumam do disco no meio da
gravação. Ver mapa geral em
[`PLANO-GRAVACAO-CURSO.md`](./PLANO-GRAVACAO-CURSO.md).

A branch `aula2/pipeline-evals` existe apontando pro mesmo conteúdo, caso
você prefira gravar a partir dela — mas o caminho recomendado é ficar em
`master`.

Confira antes de gravar que o pipeline está no lugar:

```bash
node evals/run-evals.js --help
```

---

## 2.1 — O que são evals? (10 min)

**Objetivo:** compreender o conceito de evals e por que são essenciais pra
garantir qualidade de forma contínua.

**Fala sugerida (bullets):**
- Eval = teste automatizado, mas pra qualidade de resposta em vez de
  correção de código. Não existe "verde/vermelho" simples — existe
  critério.
- Por que não dá pra revisar cada resposta à mão: o Chef Caseiro já gerou
  68 traces num mês de uso de uma casa só. Multiplique por usuários reais.
- A diferença entre testar uma vez (antes do deploy) e avaliar
  continuamente (depois do deploy, em produção real): o modelo, o prompt e
  os dados mudam — um eval que passou ontem pode falhar hoje sem nenhuma
  mudança de código sua.
- Evals não substituem observabilidade nem guardrails — são a primeira
  camada, a que responde "isso é bom?" antes de "isso está funcionando?"
  (Aula 3) e "isso é seguro?" (Aula 5).

**Demo:** nenhuma — vídeo conceitual.

**Slides — outline:**
1. **"O que é um eval?"** — bullets: teste de qualidade, não de correção;
   critério em vez de asserção; roda continuamente, não só uma vez.
2. **Por que não dá pra revisar à mão** — número real: 68 traces em um mês,
   uma casa só; escala isso pra produção de verdade.
3. **Onde o eval entra no ciclo** — reusar o diagrama da Aula 1 (Evals →
   Observabilidade → Conformidade), destacando a primeira seta.

**Se der errado:** sem dependência técnica.

---

## 2.2 — Critérios de qualidade (12 min)

**Objetivo:** criar critérios claros e mensuráveis pra avaliar se as
respostas do produto são boas, usando linguagem acessível e sem
necessidade de código.

**Fala sugerida (bullets):**
- Um critério bom é uma pergunta que qualquer pessoa da equipe conseguiria
  responder olhando a resposta — sem saber programar.
- Exemplos concretos do Chef Caseiro: "a sugestão usa só ingredientes que
  existem no estoque?", "a receita respeita as restrições da casa?", "o
  agente registrou o consumo depois de sugerir?" (este último é
  literalmente o achado §11.3 do SDD, viraria um eval direto).
- Critério ruim vs. critério bom: "a resposta é boa" (vago) vs. "a resposta
  cita pelo menos 3 ingredientes do estoque atual" (mensurável).
- Onde threading esses critérios ficam no produto real: `evals/criterios.md`.

**Demo:**
1. Abrir `evals/criterios.md` e ler 2-3 critérios junto com a turma.
2. Relacionar cada critério com um requisito real do SDD (§7.3, §7.4) —
   mostrar que o critério não nasce do nada, nasce da spec.

**Slides — outline:**
1. **"O que faz um critério ser mensurável"** — bullets: pergunta binária
   ou escalar; qualquer pessoa consegue julgar; ligado a um requisito real.
2. **Critérios do Chef Caseiro** — lista dos critérios de `criterios.md`
   (atualizar com o conteúdo real da branch no dia).
3. **Critério ruim → critério bom** — antes/depois lado a lado.

**Se der errado:** se `evals/criterios.md` não existir ainda na branch,
volte pro `SDD.md §7` e derive 3 critérios ao vivo a partir dos requisitos
funcionais documentados — não é o ideal, mas mantém a aula em pé.

---

## 2.3 — Claude como avaliador (12 min)

**Objetivo:** usar o Claude como avaliador sistemático de respostas,
construindo prompts estruturados que simulam o julgamento de um
especialista humano.

**Fala sugerida (bullets):**
- Claude-as-judge: um segundo agente que lê a interação (pedido + resposta
  + estado do estoque) e julga contra os critérios da 2.2.
- O mesmo padrão que já é convenção no projeto: **`tool_choice` forçado**
  pra saída estruturada. Não é a primeira vez — é a mesma lição do achado
  §11.3 do SDD (`registrar_itens_usados` no `agent.js`, extração inteira em
  `nota-fiscal.js`), reaplicada aqui pro juiz: pedir "responda em JSON" no
  prompt não garante nada; forçar a tool garante.
- Por que isso importa especificamente para um juiz: se a saída do juiz não
  é estruturada de verdade, você não consegue agregar score nenhum depois.
- O output do juiz vira Score gravado de volta no Langfuse, ligado ao
  `trace_id` da interação original — é o que a Aula 3 vai usar pra mostrar
  "qualidade ao longo do tempo".

**Demo:**
1. Abrir a função de avaliação em `evals/run-evals.js` e mostrar o bloco de
   `tool_choice`.
2. Apontar onde o schema da tool descreve os critérios da 2.2 como campos.

**Slides — outline:**
1. **"Claude como juiz"** — bullets: segundo agente, lê pedido+resposta+
   estado, julga contra critério.
2. **Por que `tool_choice` forçado** — reusar a lição do §11.3: pedir não é
   garantir; forçar é. Citar as duas reaplicações anteriores no código
   (agent.js, nota-fiscal.js) como prova de que é convenção, não invenção
   pra esta aula.
3. **Do julgamento ao dado** — diagrama curto: interação → juiz → Score →
   Langfuse (`trace_id`), preparando o terreno pro 2.4.

**Se der errado:** se a chamada ao juiz falhar ao vivo (rede, chave), mostre
o código e explique o fluxo sem executar — a demo de execução real fica
garantida no 2.4.

---

## 2.4 — Primeiro conjunto de evals (15 min)

**Objetivo:** montar o primeiro conjunto de evals do Chef Caseiro, cobrindo
os cenários mais críticos de uso e os erros mais custosos.

**Fala sugerida (bullets):**
- Não avaliar tudo — priorizar pelos cenários que mais custam quando dão
  errado: sugestão que usa item fora de estoque, sugestão que ignora
  restrição alimentar, consumo não registrado.
- Rodar o conjunto contra interações reais já logadas (não interações
  sintéticas criadas na hora) — o valor do eval cai muito quando ele nunca
  viu dado real.
- **Avisar a turma agora**: depois de rodar, o Score não aparece
  imediatamente no Langfuse — o Langfuse Cloud tem **~45 segundos de lag**
  entre a exportação e o dado ficar consultável (achado §11.2 do SDD). Sem
  esse aviso, alguém vai achar que o Score sumiu ou que o script falhou.

**Demo:**
1. Rodar o conjunto de verdade:

```bash
node evals/run-evals.js
```

2. Enquanto roda, explicar o que está acontecendo (lê traces recentes → 
   chama o juiz → grava Score).
3. Abrir o Langfuse Cloud (`https://us.cloud.langfuse.com`) e tentar achar o
   Score **imediatamente** — mostrar que ainda não está lá.
4. Esperar (ou cortar na edição) e mostrar o Score aparecendo depois do lag.

**Slides — outline:**
1. **"Priorizando o que avaliar"** — bullets: cenário crítico > cobertura
   total; os 3 cenários escolhidos pro primeiro conjunto.
2. **Rodando contra dado real** — bullets: por que não usar exemplos
   sintéticos; de onde vêm as interações avaliadas (traces já logados).
3. **O lag do Langfuse** — bullets: ~45s entre export e consulta; por que
   isso é esperado, não bug; como isso muda a forma de automatizar em cima
   do Score.

**Se der errado:** se o script demorar mais que o esperado ou a chave de
API tiver algum problema, tenha um Score já gravado de uma execução prévia
para mostrar na tela do Langfuse como plano B — não trave a gravação
esperando rede.

---

## 2.5 — O que aprendemos? (texto)

- Eval é o critério que decide se uma resposta é boa, de forma repetível.
- Critério mensurável nasce do requisito real do produto, não de intuição.
- Claude-as-judge só é confiável com saída estruturada forçada — mesma
  regra do resto do projeto.
- O primeiro conjunto de evals prioriza os cenários mais custosos, roda
  contra dado real, e escreve Score de volta no Langfuse (com um lag real
  de ~45s que vira conteúdo da Aula 3).
