# Roteiro — Aula 2.2 (Critérios claros e mensuráveis)

**Objetivo de aprendizagem:** criar critérios claros e mensuráveis pra avaliar se as respostas do produto são boas, em linguagem acessível, sem código.
**Tempo:** ~12 min. **Formato:** majoritariamente prático, na janela.

---

## Beat 0 — Abertura (30s)

**Slide:**
> **2.2 — Critérios claros e mensuráveis**
> Transformar "a resposta foi boa" em algo que dá pra checar — sem escrever uma linha de código.

**Fala:**
> "No funil do slide passado vimos Cenário → Resposta → Critério → Evidência. Hoje a gente para exatamente no Critério — é o passo mais fácil de fazer errado, e o único que não precisa de código nenhum."

---

## Beat 1 — Critério vago (2 min)

**Ação na janela:** abre `docs/criterios-2.2.md` no VS Code, Markdown Preview (`Ctrl+Shift+V`), rolado só até o título + Cenário.

**Fala:**
> "Como vocês avaliariam se a resposta do Mediador foi boa?"
*(pausa)*
> "A resposta que sempre vem é 'bem escrita', 'fez sentido', 'pareceu certo'. Isso é opinião, não é critério."

**Ação na janela:** rola até a seção "Critério vago", mostra:
> "A resposta do Mediador foi boa."

**Fala:**
> "Dá pra automatizar isso? Dá pra checar sim ou não, sem eu precisar ler e *sentir*?"

---

## Beat 2 — Técnica (1,5 min)

**Fala:**
> "A pergunta dupla que **começa a resolver** isso: **o que eu esperaria ver?** e **o que eu NÃO aceitaria ver?** Todo critério bom termina numa frase que dá pra checar com sim ou não. Isso é disciplina de linguagem — nenhuma linha de código até aqui."

**Ação na janela:** rola até a seção "Critérios", revela a lista dos 5 (ainda sem a tabela de Evidência).

---

## Beat 3 — Aplicação no cenário real (3 min)

**Ação no produto:** abre `localhost:3300`, mostra:
- Painel **Atividade** → desejo do risoto, lembrete das marmitas, os 3 relatos de fora
- Kanban → coluna **Consumo** → "Lasanha (marmita)" 3/4

**Fala:**
> "Isso não é encenado — é dado real, gerado através do próprio produto: subimos uma nota fiscal, trocamos duas mensagens simulando a conversa de casa, e o sistema já tinha esse histórico de refeições fora e uma marmita esquecida."

**Ação na janela:** volta pro `docs/criterios-2.2.md`, mostra a seção "Cenário" — bate exatamente com o que acabou de aparecer no produto.

---

## Beat 4 — Evidência (3 min)

**Ação na janela:** rola até a tabela de "Evidência" no arquivo — os 5 critérios aplicados na trace real do Mediador.

**Fala:**
> "Disparamos o Mediador com esse contexto todo. E aqui está o resultado aplicando nossos critérios: 4 dos 5 não passaram. Não porque ele decidiu errado — porque ele **não decidiu nada**. Consultou as cinco ferramentas certas, na ordem certa, e voltou sem texto, sem proposta."

*(opcional, se o tempo permitir)* **Ação no produto:** abre o Langfuse, mostra a trace `3d78e29ce5a343d66c5781692dce2748` — os 5 tool calls corretos, seguidos de um bloco de `thinking` vazio.

**Fala:**
> "Isso é uma coisa que só um critério checável revela. 'A resposta foi ruim' não diferencia isso de uma resposta mal escrita — 'não citou os itens não consumidos' sim."

---

## Beat 5 — Fechamento / gancho pro 2.3 (1 min)

**Fala:**
> "Só que aplicar essa checklist, item por item, ainda é trabalho manual. Na próxima aula, o próprio Claude vira quem aplica os critérios — e aí sim, código entra em cena."

**Slide:**
> **Do critério vago ao checável**
> ❌ "A resposta foi boa."
> ✅ 5 critérios, cada um com sim/não — aplicados numa trace real, agora.
> *Próximo: o Claude como avaliador (2.3)*

---

*Roteiro gerado durante ensaio de gravação, branch `ensaio-aula4`, com base no cenário real documentado em `docs/criterios-2.2.md`.*
