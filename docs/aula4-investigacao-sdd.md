# Investigação de incidentes — formato SDD (Aula 4)

Documento iterativo, um episódio por seção, no mesmo formato de `SDD.md`
§11 (Observação → Diagnóstico → Restrição derivada), com dois campos a mais
por episódio: **Impacto no produto** e **Backlog priorizado** — o objetivo
de cada entrada não é só registrar o achado, mas sair com uma solução
proposta e priorizada para decisão futura.

**Convenção em vigor:** nada aqui é corrigido sem perguntar antes (ver
`CLAUDE.md`, "Convenção de processo"). Este documento propõe e prioriza;
não aplica.

---

## Episódio A — erro de rede silenciado pelo próprio aviso de erro

**Fonte:** `docs/aula4-roteiro-falha-telegram.md`, log real de 21/08/2026.

### Observação

```
2026-08-22T01:30:11.106373641Z | Erro capturando relato/desejo/aquisicao via Telegram: fetch failed
2026-08-22T01:30:11.106381240Z | Erro processando update do Telegram: fetch failed
```

Nenhuma resposta ao usuário, nenhum item no estoque. Duas linhas de log,
nada além disso.

### Diagnóstico

As duas linhas têm **8 microssegundos** de diferença — tempo insuficiente
para qualquer chamada de rede real acontecer entre elas. Não são dois
erros: é um erro só. Um `fetch` real falhou dentro de
`ingerirRelato`/captura da mensagem (linha 1); o código tentou avisar o
usuário sobre esse erro, essa segunda chamada de rede *também* falhou
(mesma classe de problema — rede indisponível), e o `catch` mais externo
capturou a falha do aviso, não a falha original. O aviso comeu a evidência.

### Impacto no produto

- O usuário não recebeu nenhuma explicação — do lado de quem usa, o
  produto simplesmente ignorou uma nota fiscal.
- A causa real (`fetch failed` de quê — Anthropic? Telegram? Supabase?
  DNS? TLS? conexão recusada?) nunca foi revelada, porque `fetch failed`
  do Node esconde a causa dentro de `err.cause`, que ninguém logava.
- Para um produto cujo valor é "confiar que o estoque reflete a realidade
  da casa", uma falha que não se explica — nem para o usuário, nem para
  quem opera — corrói exatamente essa confiança.

### Correção já aplicada (PR #4, mergeado 09/09)

Em `telegram.js`:

- `detalharErro(err)` — desembrulha `err.cause`, então `fetch failed` vira
  `fetch failed (causa: ENOTFOUND)` e diz de que host se trata.
- `avisar(chatId, text)` — envolve `enviarMensagem` em try/catch **próprio**
  e isolado; se o aviso falhar, o erro do aviso fica só no log
  (`detalharErro`), sem substituir o erro original que o chamou.
- `enviarMensagem()` passa a checar `res.ok` — a API do Telegram responde
  `200` com `{ok:false}` em vários erros; antes, uma mensagem que nunca
  chegou parecia enviada.

### Achado novo desta investigação (16/09) — a correção não fechou o caminho todo

Rastreando a cadeia completa de chamadas:

| Onde | Protegido por `avisar()`? | Se falhar |
|---|---|---|
| `telegram.js:254,257,267,339,357,377,380,411` (fluxos de ingestão) | ✅ sim | erro isolado, causa preservada |
| `telegram.js:215` — `perguntarIdentidade(chatId)` (foto, autor desconhecido) | ❌ não | propaga cru |
| `telegram.js:291` — `enviarMensagem(chatId, ...)` direto (`/eusou_chef`) | ❌ não | propaga cru |
| `telegram.js:297` — `perguntarIdentidade(chatId)` (texto, autor desconhecido) | ❌ não | propaga cru |
| `server.js:648` — chamada a `processarUpdate(...)`, dentro de `try { } catch (err) { console.error('Erro processando update do Telegram:', **err.message**) }` | ❌ não usa `detalharErro` | loga `err.message` puro — sem causa |

Ou seja: **se qualquer uma das três chamadas desprotegidas falhar por
rede hoje**, o erro sobe até o catch externo do `server.js`, que registra
literalmente `Erro processando update do Telegram: fetch failed` — a
mesma segunda linha do incidente original, sem causa, um nível acima da
correção. A correção resolveu o **caso capturado**, não a **classe** de
falha.

### Restrição derivada

1. `detalharErro()` precisa ser aplicado em **toda** fronteira de `catch`
   que loga erro — não só nos catches internos de `telegram.js`. Um
   `detalharErro` que não está no catch mais externo do pipeline não
   protege o caso em que o erro escapa de um caminho não coberto.
2. Toda chamada que manda mensagem para o usuário deve passar por
   `avisar()`, nunca por `enviarMensagem()` direto — `avisar()` é a única
   que garante que uma falha de notificação não vira a única evidência do
   log.

### Backlog priorizado

| Prioridade | Ação | Esforço | Onde |
|---|---|---|---|
| **P1** | Exportar `detalharErro` de `telegram.js` e usá-lo no `catch` de `server.js:650`; trocar as 3 chamadas desprotegidas (`telegram.js:215`, `291`, `297`) por `avisar()` | baixo — 4 pontos de edição, sem mudança de comportamento visível | `server.js:649-651`, `telegram.js:215,291,297` |
| **P2** | Teste automatizado que simule falha de rede do Telegram (mock de `fetch` rejeitando) e verifique que o log final contém a causa, não só "fetch failed" | médio — projeto ainda não tem suíte de testes (`SDD.md` §12) | novo `tests/telegram.test.js` |
| **P3** | Alerta real sobre `fetch failed`/erros de canal — hoje é só `console.error` lido manualmente no Railway; nada notifica proativamente | alto — depende de escolher ferramenta de alerta | observabilidade, fora do escopo do produto atual |

**Recomendação:** priorizar P1 antes da próxima aula que reproduzir
qualquer fluxo de Telegram — é baixo esforço e fecha exatamente o mesmo
tipo de furo que a aula usa como exemplo central de "não corrigir o
sintoma, corrigir a classe". Não aplicado nesta sessão — decisão de
correção fica com o Diego.

---

## Episódio B — a falha perfeitamente silenciosa

**Fonte:** `docs/aula4-roteiro-falha-telegram.md`, segundo episódio
(22/08/2026).

### Observação

A mesma nota fiscal foi reencaminhada no dia seguinte ao Episódio A.
Resultado, checado em cinco lugares:

| Onde olhar | O que tem |
|---|---|
| Resposta no Telegram | nada |
| Log do Railway | nenhuma linha |
| Trace no Langfuse | nenhum trace |
| Banco (pensamentos/estoque) | nada |
| `getWebhookInfo` do Telegram | `pending_update_count: 0`, `last_error: nenhum` |

### Diagnóstico

Por eliminação: o `getWebhookInfo` confirma que o Telegram **entregou** o
update ao servidor sem erro — descarta falha de canal. Sem nenhuma linha de
log e sem trace, o código não pode ter executado nenhum branch que gera
saída (nem sucesso, nem erro) — isso descarta exceção não tratada, porque
até uma exceção deixaria rastro num `catch` com log. Só existe uma
explicação compatível com "recebeu, e nada mais": um ponto no código que
decide, de propósito, não fazer nada, e retorna sem logar. Confirmado como
o `if (!message || !message.text) return;` — a nota "difícil" era uma
foto/PDF do cupom, formato que o produto ainda não sabia ler.

### Impacto no produto

- Esta é a categoria de falha mais perigosa das cinco da aula: uma ausência
  não dispara nenhum alarme — não existe monitor que avise "algo que
  deveria ter acontecido não aconteceu", a menos que alguém já tenha
  pensado nisso antes.
- Do lado do usuário, o produto passa a impressão de simplesmente ignorar
  um pedido legítimo, sem nenhuma pista de por quê.

### Correção já aplicada (PR #4 e PR #6, mergeados)

- **PR #6** — foto de cupom passou a ser processada de verdade
  (`telegram.js:212-260`, bloco `Array.isArray(message.photo)`).
- **Formatos ainda não suportados** (áudio, documento) — `telegram.js:262-270`
  agora loga um `console.warn` e chama `avisar()` com mensagem honesta:
  "Ainda não sei processar {tipo}. Foto de cupom eu já leio; o resto, por
  texto."

### Achado novo desta investigação (16/09) — o padrão do `return` mudo continua em dois pontos

A correção cobriu os formatos conhecidos na época (foto, áudio, documento),
mas o **padrão estrutural** — um `return` sem log — continua existindo em
pontos que não foram tocados:

1. **`telegram.js:202`** — `if (!message) return;`. Qualquer update do
   Telegram que não seja `message` nem `callback_query` (ex.:
   `edited_message`, `channel_post`, `poll_answer`, `my_chat_member` — o
   Telegram manda todos esses tipos pro mesmo webhook) desaparece sem
   nenhum log, exatamente como acontecia com a foto antes do PR #6.
2. **`telegram.js:192`** — `if (!role) return;`, dentro do tratamento de
   `callback_query`. Um clique num botão com `data` que não seja `bg:*`,
   `eusou_chef` ou `eusou_musa` (ex.: teclado inline de uma versão antiga
   do produto ainda visível no celular de alguém, ou um clique duplicado)
   também retorna em silêncio — sem log e sem resposta ao clique.

### Restrição derivada

"Nunca falhar em silêncio" (`SDD.md` §8) foi aplicada **caso a caso**
(foto, áudio, documento) em vez de **estruturalmente**. A restrição mais
forte: todo `return` dentro de `processarUpdate` que não passa por nenhum
log é, por definição, suspeito — a pergunta de revisão de código deveria
ser "este `return` registra que decidiu ignorar, e por quê?", não "este
tipo específico de mensagem já tem tratamento?".

### Backlog priorizado

| Prioridade | Ação | Esforço | Onde |
|---|---|---|---|
| **P1** | Adicionar um log (nível `warn`, mesmo padrão da linha 265) antes dos dois `return` mudos, citando o tipo de update/`callback_data` ignorado | baixo — 2 linhas | `telegram.js:192,202` |
| **P2** | Um log de saída ao final de `processarUpdate` confirmando que algum branch tratou o update, com `warn` se nenhum tratou — defesa estrutural contra o próximo `return` mudo que alguém adicionar sem perceber | médio — pequeno refactor de fluxo | `telegram.js` |
| **P3** | Estender o mesmo raciocínio (buscar por `return` sem log) para os outros handlers de canal do produto (`server.js`, rotas REST) como checagem periódica, não só reativa a incidente | baixo, recorrente | processo, não código |

**Recomendação:** P1 é praticamente gratuito e fecha a mesma classe de
risco do Episódio A — bom candidato a agrupar com o P1 daquele episódio
num único ajuste, se e quando o Diego decidir aplicar. Não aplicado nesta
sessão.

---

## Episódio C — a conta bateu, o estoque não

**Fonte:** `docs/apoio/evidencia-preservada.md` (Evidência 2), trace
`41a4e5c75e3331cad95e7ffe8ba9932d`, 22/08/2026.

### Observação

```
Mensagem: "Comemos 3 porções de lasagna, 1 e 1/2 para cada!"

Saída do modelo:
{
  "tipo": "relato_refeicao", "descricao": "Comeram 3 porções de lasagna ao
  total, 1 e 1/2 porção para cada pessoa", "data": "2026-08-22",
  "fonte_refeicao": "caseira", "item_nome": "lasagna", "item_quantidade": 3
}

Estoque, verificado depois: { "name": "lasanha", "portions_total": 5,
"portions_remaining": 5 }
```

Reação 👍 enviada. Relato gravado. `meal_report` gravado. Nada indicou erro
em nenhum sistema de monitoramento.

### Diagnóstico

O modelo classificou tudo corretamente — inclusive resolveu a aritmética
implícita ("1 e 1/2 para cada", duas pessoas → 3). O problema está depois
do modelo, na camada determinística que baixa o estoque:
`intencao-efeitos.js:39-46` (`acharPreparadoVivo`) busca o prato com
`.ilike('name', '%${nome}%')`, um match por substring. `nome` chega como
`"lasagna"` (grafia do relato); o item está gravado como `"lasanha"`. Nem
`%lasagna%` casa com `"lasanha"`, nem o inverso — a diferença não é acento
nem caixa, é a sequência de letras em si (`gn` × `nh`). A mesma limitação
existe em `tools.js:367-372` (`nomesCasam`), usada em `verificar_disponibilidade`
e `marcarCompradoNaLista`: também é substring simples, sem tolerância a
variação ortográfica.

### Impacto no produto

- É o caso mais difícil de detectar dos cinco: **nenhum** sistema de
  observabilidade aponta isso — sem erro, sem trace vermelho, sem log de
  aviso. A única forma de perceber é cruzar o trace da conversa com o
  estado resultante no banco, ativamente, depois do fato.
- Quebra o reflexo mais comum de debugging em produtos de IA — "o problema
  está no prompt" — porque aqui o prompt e o modelo estão perfeitos; quem
  errou foi exatamente a camada que o projeto trata como mais confiável
  (a determinística).
- Consequência de produto: o usuário recebe confirmação positiva (👍) de
  uma ação que não aconteceu de verdade. Isso é mais grave do que a
  ausência do Episódio B, porque aqui existe um sinal de sucesso falso,
  não apenas silêncio.

### Status — preservado de propósito, sem correção aplicada

Diferente dos Episódios A e B, este **não tem correção pronta esperando
aplicação**. Decisão explícita do instrutor (22/08, reafirmada no
`CLAUDE.md`): manter quebrado como conteúdo real — é o gancho de abertura
da Aula 5 (guardrails/transparência). As opções de solução existem, mas
nenhuma é trivial o suficiente para aplicar sem debate:

| Opção | Ganho | Risco |
|---|---|---|
| Match aproximado (distância de edição / fuzzy) entre `lasagna`/`lasanha` | resolve este caso específico | falso positivo real em contexto de cozinha: grão-de-bico × grão, leite × leite condensado, farinha de trigo × farinha de rosca — itens **diferentes** que ficariam mais parecidos entre si do que `lasagna`/`lasanha` |
| "Perguntar quando em dúvida" (o mesmo guardrail já usado no porcionamento) | reaproveita um mecanismo que o produto já defende como boa prática | **o mesmo mecanismo já demonstrou falhar** em outro episódio do produto quando a conversa exige mais de uma troca de mensagem sem memória — não é solução gratuita |
| Match feito pelo próprio modelo (LLM decide se `lasagna` e `lasanha` são o mesmo prato, em vez de comparação de string) | tolera variação de linguagem natural genuinamente | reintroduz decisão probabilística numa camada que o projeto defende, por princípio, como determinística (`SDD.md` §13.2) |

### Restrição derivada (parcial — decisão pendente)

Não há uma restrição fechada ainda. O que já dá pra afirmar: **substring
simples (`ilike`/`includes`) não é suficiente para nomes ditos em
linguagem natural livre**, e qualquer solução only precisa ser avaliada
contra falso positivo em domínio de cozinha, não só contra este caso.

### Backlog priorizado

| Prioridade | Ação | Esforço | Onde |
|---|---|---|---|
| **P1** | Nenhuma correção de código — decisão explícita de manter como está até a Aula 5 fechar o tema de guardrails | — | — |
| **P2** | Quando decidido, começar pelo caso mais barato de testar sem risco: alertar (não corrigir sozinho) quando um `item_nome` do relato **não** casa com nenhum item `preparado` no estoque — reaproveita o padrão "nunca falhar em silêncio" sem decidir ainda qual heurística de match usar | baixo — é observabilidade, não correção | `intencao-efeitos.js:72-83` |
| **P3** | Consolidar os dois pontos de match (`acharPreparadoVivo` e `nomesCasam`) numa função só, para que qualquer decisão futura sobre tolerância de grafia valha para os dois caminhos ao mesmo tempo, em vez de divergir | médio | `tools.js:367-372`, `intencao-efeitos.js:39-46` |

**Recomendação:** priorizar P2 antes de qualquer coisa — dá visibilidade
sem comprometer a decisão de design que fica para a Aula 5. Nada aplicado
nesta sessão.

---

## Episódio D — o hambúrguer que sumiu

**Fonte:** `docs/apoio/evidencia-porcionamento-patinho.md`, conversa real de
14/09/2026, 18h17-18h18.

### Observação

Quatro mensagens reais no Telegram, cada uma classificada **corretamente**
pelo agente de ingestão, e mesmo assim o item preparado nunca entrou no
estoque:

| # | Mensagem | Classificação | O que faltou |
|---|---|---|---|
| 1 | "O que vamos comer na sexta?" | `desejo` — correto | — |
| 2 | "Preparei hambúrguer de patinho, 220g..." | `porcionamento`, `item_nome` correto | `item_quantidade` ausente (a info estava na frase — "dois de cada" — mas não no formato esperado); guardrail perguntou, nada gravado |
| 3 | "Porcionei em 2 unidades de 220g e 2 unidades de 160g" (resposta direta à pergunta do bot) | `porcionamento` | `item_nome` ausente — resposta direta não repete o nome do prato; nada gravado |
| 4 | "O hambúrguer de patinho" | reclassificado como `desejo` | frase nominal solta, sem contexto explícito de que é resposta pendente; conversa encerra sem gravar nada |

Estado final: `carne moída patinho` (matéria-prima) intacta; **nenhum**
item `state="preparado"` com nome parecido a "hambúrguer de patinho" — o
prato pronto, fisicamente cozinhado e porcionado, nunca existiu no sistema.

### Diagnóstico

Rodando o framework de diagnóstico da própria aula (prompt, dados ou
modelo?) contra os quatro traces: **nenhuma das três explica a falha.**

- Prompt de cada chamada: correto — pediu exatamente o que devia.
- Dados de cada mensagem: claros e não-ambíguos, isoladamente.
- Modelo: acertou a classificação quatro vezes seguidas, inclusive extraindo
  `item_nome` corretamente na mensagem 2.

A causa é uma quarta categoria, arquitetural: `ingerirRelato({ texto,
dataReferencia, model, canal })` (`relato-ingestao.js:117`) recebe **só o
texto da mensagem atual** — a assinatura da função não tem parâmetro de
histórico. O classificador não sabe que existe uma pergunta pendente
esperando aquela resposta específica; cada chamada começa do zero.

### Impacto no produto

- O guardrail "porcionar sem número dito vira pergunta, nunca chute" —
  citado no próprio projeto como exemplo de boa prática (§13.2 do `SDD.md`)
  — **pressupõe continuidade de conversa que a implementação não tem**. O
  guardrail dispara corretamente e ainda assim o ciclo nunca se resolve.
- É pior que um erro isolado: quatro mensagens reais, uma ação física de
  verdade (cozinhar e porcionar), resultado líquido zero — e nenhuma das
  quatro interações produz um erro visível. O usuário só percebe a falha se
  for conferir o estoque depois.
- **Os evals da Aula 2 não pegariam isso.** `evals/run-evals.js` julga um
  trace por vez, contra um critério de qualidade daquela interação isolada.
  Rodado contra qualquer um dos quatro traces acima, o veredito seria
  "aprovado" nos quatro — cada classificação, isolada, está certa. Corrigir
  isso exigiria um critério novo: não "esta resposta está certa?", mas
  "este ciclo de pergunta-e-resposta chegou a se resolver?" — um tipo de
  avaliação que o pipeline atual não constrói.

### Status — sem decisão de correção (mesma convenção dos demais achados)

### Backlog priorizado

| Prioridade | Ação | Esforço | Onde |
|---|---|---|---|
| **P1** | Reaproveitar um padrão que **já existe** no produto para outro fluxo: `perguntarOrcamento` (`telegram.js:71-78`) ancora a pergunta pendente no próprio botão (`callback_data: "bg:categoria:${pensamentoId}"`), então a resposta chega associada ao pensamento certo sem depender de memória de texto livre. Para porcionamento, isso significa: quando o guardrail perguntar "quantas porções rendeu X", persistir uma linha de "pergunta pendente" (`item_nome` + `chat_id` + timestamp) e, na próxima mensagem sem `item_nome`, **checar essa pendência antes de classificar do zero** — em vez de perguntar via texto livre, tratar como continuação. Não exige conversa multi-turno completa. | baixo-médio — reusa padrão já validado em produção | `intencao-efeitos.js` (onde a pergunta de porcionamento é gerada), tabela nova ou campo em `pensamentos` |
| **P2** | Generalizar P1 para qualquer guardrail que faça pergunta (não só porcionamento) — uma pequena tabela de "estado de conversa pendente" por ator/chat, com expiração | médio | `intencao-efeitos.js`, `relato-ingestao.js` |
| **P3** | Memória de conversa real (últimas N mensagens como contexto pro classificador) | alto — maior custo, maior superfície de erro, e reabre a tensão do projeto sobre quanto confiar em julgamento do modelo (`SDD.md` §13.2) | `relato-ingestao.js` |
| **P4 (pré-requisito de qualquer correção)** | Critério de eval novo, multi-trace: "este ciclo de pergunta-resposta se resolveu?" — sem isso, nenhuma correção acima tem como ser validada automaticamente, só testada manualmente | médio | `evals/` (novo critério, fora do padrão atual de 1 trace por avaliação) |

**Recomendação:** P1 é o único caminho que resolve o caso real sem herdar o
risco arquitetural de memória de conversa completa — e reaproveita um
padrão que o próprio produto já confia (`bg:` callback). P4 deveria
acompanhar qualquer decisão de correção, não vir depois. Nada aplicado
nesta sessão.

---

*(próximos episódios entram aqui, uma seção por vez, conforme forem
discutidos)*
