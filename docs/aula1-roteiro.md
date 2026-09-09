# Aula 1 — O produto lançou. E agora?

Versão do produto: **`master`, produção** — https://chef.workshopee.com.br
(Basic Auth). Nenhum checkout, nenhum deploy nesta aula. Ver mapa geral em
[`PLANO-GRAVACAO-CURSO.md`](./PLANO-GRAVACAO-CURSO.md).

---

## 1.1 — Apresentação (3 min)

Vídeo de apresentação própria + audiodescrição. Sem demo, sem slide de
produto — segue o padrão de apresentação pessoal da Alura.

**Fala sugerida (bullets):**
- Quem é você, o que já construiu, por que está ensinando isso agora.
- O que o aluno vai conseguir fazer ao final: operar um produto com IA em
  produção, não só construir um.
- Uma frase de gancho: "lançar é fácil comparado com manter".

**Se der errado:** este vídeo não depende de nenhum sistema externo — sem
plano B técnico necessário.

---

## 1.2 — Lançar é o começo (5 min)

**Objetivo:** entender por que o lançamento de um produto é o início de um
ciclo contínuo de operação, e não o fim do trabalho.

**Fala sugerida (bullets):**
- O erro mental mais comum: tratar "deploy" como a linha de chegada.
- Com IA isso é pior que com software tradicional — o modelo muda de
  comportamento sem você mudar uma linha de código (nova versão, novo
  contexto, novo usuário).
- Chef Caseiro como exemplo real: já está em produção, já tem uso real
  (você mesmo, em casa), já gerou dado real — e ainda assim tem bug vivo
  esperando pra ser mostrado nas aulas 3 e 4. **Não entregar qual bug
  ainda.**
- O ciclo que o curso ensina: evals → observabilidade → conformidade →
  volta pro evals. Não é uma lista, é um loop.

**Demo:**
1. Abrir https://chef.workshopee.com.br, autenticar com Basic Auth.
2. Mostrar o painel rodando de verdade: faixa de estado, feed, composer de
   conversa.
3. Rolar o feed até achar um `pensamento` de alguns dias atrás — prova de
   que é uso real, não seed de demo.

**Slides — outline:**
1. **"Deploy não é o fim"** — bullets: linha de chegada errada; software
   tradicional degrada por bug, IA degrada por comportamento; o ciclo
   contínuo começa aqui.
2. **Chef Caseiro em produção** — bullets: assistente de cozinha real, uso
   doméstico real, dado real desde 27/07; screenshot do painel.
3. **O loop da operação** — diagrama simples: Evals → Observabilidade →
   Conformidade → (volta pro início); cada seta é uma aula.

**Se der errado:** se o site estiver fora do ar, use um screenshot/gravação
de tela feita previamente do painel — não dependa da rede da escola ao
vivo para este vídeo (ele é conceitual, a demo é ilustrativa, não o ponto
central).

---

## 1.3 — Os três pilares da operação (5 min)

**Objetivo:** conhecer os três pilares que sustentam a operação saudável de
um produto: evals, observabilidade e conformidade responsável.

**Fala sugerida (bullets):**
- **Evals** — como você sabe que a resposta é boa, sem revisar cada uma à
  mão? (gancho pra Aula 2)
- **Observabilidade** — como você enxerga o que está acontecendo em
  produção sem estar olhando o tempo todo? (gancho pra Aula 3)
- **Conformidade responsável** — como você garante que o produto não
  ultrapassa limites que protegem o usuário e a empresa? (gancho pra Aula
  5)
- Os três não são sequenciais na prática — eles se alimentam: um evals mal
  feito não detecta a falha que a observabilidade só encontra depois; uma
  falha de observabilidade sem guardrail vira incidente de conformidade.
- Não entregar o exemplo de cada pilar ainda — só nomear.

**Demo:** nenhuma — vídeo conceitual, apoiado só em slide.

**Slides — outline:**
1. **"Três pilares"** — três colunas: Evals / Observabilidade /
   Conformidade, cada uma com uma pergunta-chave (a resposta é boa? / o que
   está acontecendo? / onde estão os limites?).
2. **Como eles se conectam** — diagrama circular ligando os três pilares de
   volta ao ciclo do 1.2.
3. **O que vem a seguir** — bullets nomeando cada aula (2 = evals, 3 e 4 =
   observabilidade, 5 = conformidade) sem entregar conteúdo.

**Se der errado:** sem dependência técnica — só slide.

---

## 1.4 — Mapeando riscos do produto (5 min)

**Objetivo:** aplicar um mapeamento inicial de riscos operacionais no Chef
Caseiro, identificando onde as coisas podem dar errado.

Este é o vídeo-gancho da aula: planta as sementes das Aulas 3 e 4 **sem
entregar o final**. Use riscos reais do produto, não hipotéticos.

**Fala sugerida (bullets) — quatro riscos reais, ditos como pergunta, não
como spoiler:**
1. **Custo concentrado num único agente.** "O Mediador de cardápio é 15%
   das chamadas do produto — e mais de dois terços da conta. O que acontece
   se ele começar a rodar em loop, ou se o preço do modelo mudar?" (não
   dizer o número exato ainda — isso é conteúdo da Aula 3/RUNBOOK §3, deixar
   pra lá).
2. **Correspondência de dado que pode falhar em silêncio.** "O sistema
   registra o que a pessoa disse. Mas e se o que ela disse não bater
   exatamente com o que está gravado no banco? O sistema avisa, ou fica
   quieto?" (não mencionar "lasagna/lasanha" — é o episódio C, gancho puro
   pra Aula 4).
3. **Canais que não avisam quando falham.** "Bot recebe uma mensagem que
   não sabe processar. O que ele faz — devolve um erro, ou finge que nunca
   recebeu nada?" (gancho pro episódio B do Telegram, Aula 4).
4. **O modelo fazendo conta.** "Em algum lugar desse sistema, o modelo de
   linguagem soma dois números em vez de um código fazer isso. Por que isso
   é arriscado, mesmo quando a conta dá certo?" (gancho pro achado das
   porções da lasanha, sem entregar).

**Demo:**
1. Mostrar rapidamente `agent.js` — apontar o span do agente no Langfuse
   sem abrir trace nenhum (só a existência da instrumentação já é o ponto:
   "cada chamada vira uma observação").
2. Mostrar o arquivo `tools.js` e apontar (sem explicar o bug) a função de
   correspondência de nome usada pra baixar estoque.
3. Fechar com a pergunta central da aula: "quantos desses riscos esse
   produto já sofreu de verdade, em produção, essa semana?" — resposta:
   "vamos ver nas próximas aulas".

**Slides — outline:**
1. **"Mapa de riscos — Chef Caseiro"** — matriz simples 2x2 (impacto ×
   probabilidade) com os quatro riscos como pontos, sem revelar desfecho.
2. **Risco 1: custo concentrado** — bullets: um agente, muitas chamadas
   caras; o que monitorar; qual pergunta fazer antes de escalar.
3. **Risco 2 e 3: silêncio como falha** — bullets: dado errado sem alarme;
   canal que não confirma nem nega; por que "não aconteceu nada" é o pior
   sintoma de todos (mais difícil de notar que um erro visível).
4. **Risco 4: modelo fazendo aritmética** — bullets: por que é tentador
   deixar o modelo somar; por que a regra de ouro do projeto é "matemática
   sempre em código"; o que pode dar errado quando essa regra é quebrada
   por um caso de borda.
5. **Gancho de fechamento** — "Esses quatro riscos vão aparecer de novo —
   com nome, número e trace — nas Aulas 3 e 4."

**Se der errado:** se o Langfuse não abrir ao vivo, use um screenshot
estático do painel de traces — o ponto do vídeo é nomear o risco, não
demonstrar a ferramenta (isso é Aula 3).

---

## 1.5 — O que aprendemos? (3 min, texto)

Não é vídeo — é o texto de fechamento da aula. Resumo em bullets:

- Lançar é o começo de um ciclo, não o fim de um projeto.
- Os três pilares que sustentam esse ciclo: evals, observabilidade,
  conformidade responsável.
- Todo produto com IA em produção carrega riscos reais e mapeáveis — custo
  concentrado, falha silenciosa de dado, canal mudo, aritmética no lugar
  errado.
- As próximas aulas mostram esses riscos acontecendo de verdade, com
  evidência real do Chef Caseiro.
