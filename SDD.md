# Chef Caseiro — Especificação (SDD)

**Versão documentada:** estado do `master` em 2026-08-02
**Status:** produto fictício funcional, em uso ativo como base da Aula 4 (e apoio às Aulas 2/3) do curso Alura *"Evals, observabilidade e conformidade"* (formação AI Product Builder). Em 2026-08-02 pivotou pra "Musa Balance" (multi-ator, canal Telegram, Kanban — ver §13); o Chef Ops v1/v2 descrito nas seções 1–12 **continua existindo e funcional**, só sem superfície no dashboard (§13.5).
**Propósito deste documento:** registrar a especificação da versão atual — não como ela foi pedida originalmente, mas como ela **de fato ficou**, incluindo as restrições que só existem porque a implementação real ensinou algo que o design inicial não previa. É o ponto de partida para reconstruir o produto com entendimento próprio, não um changelog.

---

## 1. Visão geral

Chef Caseiro é um assistente que sugere o que cozinhar com base no que a casa tem em estoque e nas suas preferências/restrições. Não existe para ser um produto real — existe para produzir **traces reais e defeituosos o suficiente** para ensinar observabilidade. O critério de sucesso do produto não é "a receita é boa", é "o Langfuse tem o que mostrar".

Isso molda toda decisão de escopo abaixo: sempre que houve conflito entre "fazer o produto mais robusto" e "manter o comportamento observável/diagnosticável", a segunda opção venceu.

## 2. Papel na formação

O curso ensina, nessa ordem, evals → observabilidade → conformidade. O produto sustenta especificamente:

- **Aula 2 (evals)**: as interações logadas (`meal_suggestions`) são a matéria-prima pra um pipeline de Claude-as-judge que ainda não existe (ver §12).
- **Aula 3 (observabilidade/produção)**: leitura de dados reais de produção, padrões de falha. Os achados do §11 nasceram aqui.
- **Aula 4 (diagnóstico)**: o exercício central é trocar um "eixo" (prompt, modelo), comparar o resultado e explicar a causa pelo trace, não por suposição. Por isso os eixos existem como controles ao vivo na UI, não como variável de ambiente.

## 3. Escopo da versão atual

*(Esta seção descreve o Chef Ops v1/v2 original — ainda real e funcional, ver §13.5. Escopo do pivot v3 "Musa Balance" está em §13.)*

**Implementado e testado ponta-a-ponta:**
- Loop agêntico real (Claude + tool use) sugerindo receita a partir de estoque/preferências reais
- Estoque com duas dimensões de categorização (`state` e `storage`) e CRUD completo
- Preferências (CRUD simples)
- Confirmação de receita → decremento real de estoque + log de consumo auditável
- Ingestão de nota fiscal em texto/markdown → extração estruturada → estoque
- Três eixos ao vivo: versão de prompt, modelo de geração, (senha de acesso — não é um eixo pedagógico, é proteção de custo)
- Deploy público com HTTPS e domínio próprio

**Fora do escopo desta versão** (ver §12 para detalhe):
- Ingestão de nota fiscal por **imagem** (Claude Vision) — só texto/markdown por enquanto
- Pipeline de evals (Claude-as-judge escrevendo Score no Langfuse)
- Qualquer autenticação real de usuário (é um household único, fixo, sem login)
- Internacionalização, testes automatizados, CI

## 4. Personas

1. **A casa (usuário final fictício)** — quem interage com estoque/preferências/sugestões dentro da narrativa do produto. No pivot v3 (§13), deixa de ser um bloco indiferenciado e vira dois atores reais com objetivos parcialmente conflitantes (chef/musa) — mas o papel na arquitetura é o mesmo: quem gera o dado.
2. **O instrutor (operador real)** — quem manipula os eixos ao vivo durante a gravação, olha o Langfuse, e precisa que o produto falhe de forma **legível**, não silenciosa. A partir do v3, esta persona também é usuária real do produto em casa (§13.1) — as duas identidades convergem, não competem.

A persona 2 é a que efetivamente dita requisitos. Um requisito que deixasse a persona 1 mais feliz mas escondesse o comportamento do modelo (ex.: retry silencioso, fallback automático) foi descartado por princípio.

## 5. Arquitetura

```
Browser (public/) ──HTTP+BasicAuth──▶ Express (server.js)
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
              agent.js               nota-fiscal.js         tools.js
         (loop agentico Claude)   (extracao Claude,      (as duas tools que
         registra sugestao,       tool_choice forcado)    o agente chama;
         forca registro de                                le Supabase real)
         consumo se necessario
                    │                     │                     │
                    └──────────┬──────────┴──────────┬──────────┘
                               ▼                      ▼
                        Supabase (Postgres)    Langfuse (OTel)
                        estoque/prefs/          trace de cada
                        sugestoes/consumo        chamada+tool
```

- **`server.js`** — Express puro. Toda rota é REST direto sobre Supabase; a única lógica de negócio real que vive aqui (fora dos módulos) é o decremento de estoque na confirmação (§8.4).
- **`agent.js`** — o loop agêntico. `MAX_ITERATIONS = 5`. Cada chamada ao Claude e cada tool call é uma observação própria no Langfuse (`startObservation`, aninhado num span `asType: 'agent'`).
- **`nota-fiscal.js`** — mesma técnica de tool use, mas de passagem única (sem loop): um `tool_choice` forçado extrai a lista de itens da nota em uma chamada.
- **`tools.js`** — três tools que o Claude pode chamar durante o loop: `consultar_estoque`, `consultar_preferencias`, `registrar_itens_usados`. Todas leem/confirmam contra o Supabase real — nunca dado pré-buscado pelo backend e injetado no prompt.
- **`prompts.js`** — dois system prompts (v1/v2), a variável pedagógica central da Aula 4.
- **`instrumentation.js`** — `NodeSDK` + `LangfuseSpanProcessor`, precisa ser o primeiro `require` do processo.
- **`public/`** — front vanilla JS sem build step. Interação "objetos da cozinha" (§9.6).

## 6. Modelo de dados

8 tabelas Postgres (Supabase), schema completo em `schema.sql`:

| Tabela | Papel |
|---|---|
| `households` | 1 registro fixo — sem tela de conta |
| `preferences` | 1 preferência por linha, atômica |
| `pantry_items` | o estoque. Duas categorizações ortogonais: `state` (base/ingrediente/preparado — o quão transformado) e `storage` (seco/perecivel — onde fisicamente mora) |
| `receipts` | 1 registro por nota fiscal ingerida (auditoria — `image_path` guarda `"texto:<nome>"` quando a origem é markdown, não imagem) |
| `receipt_items` | itens extraídos de uma nota, com `confirmed` — desenhada para uma tela de revisão que **não existe ainda** (ver §12); hoje é gravada já `confirmed: true` |
| `meal_requests` | o pedido em texto livre |
| `meal_suggestions` | a sugestão gerada, com `items_used` (jsonb, `[{item_id, quantidade}]`) — só populado se o agente reportar consumo |
| `stock_consumptions` | o evento de confirmação ("fiz essa receita"); `items_consumed` é um **retrato** (nome/qtd/unidade) tirado na hora, não uma referência viva a `pantry_items` |

Duas migrações já aplicadas manualmente além do schema inicial (documentadas no fim de `schema.sql`): `items_consumed` em `stock_consumptions`, e `storage` em `pantry_items`.

## 7. Requisitos funcionais

### 7.1 Estoque
- CRUD manual (nome, quantidade, unidade, `state`, `storage`)
- Listagem **sempre** segmentada por `storage` (Geladeira / Despensa) na UI — nunca uma lista única. Isso não é preferência estética: uma lista plana de +15 itens com 5 campos por linha forçava scroll horizontal e ficou ilegível na prática (feedback direto do usuário sobre a v1 da tela).

### 7.2 Preferências
- CRUD simples, sem categorização. Acesso via botão "⚙ Preferências da casa" na barra de configuração — **não** é um objeto interativo da cozinha (ver §9.6, decisão revertida).

### 7.3 Sugestão de receita (núcleo agêntico)
- Entrada: texto livre do usuário
- O agente **pode** (v1) ou **deve** (v2) chamar `consultar_estoque` e `consultar_preferencias` antes de responder
- Ao final, se consultou estoque, deve reportar o consumo via `registrar_itens_usados` — com garantia estrutural, não só de prompt (§11.3)
- Cada chamada gera uma trace completa no Langfuse

### 7.4 Confirmação de consumo
- Sugestão não decrementa estoque sozinha — só a confirmação explícita do usuário ("fiz essa receita") decrementa `pantry_items.quantity` de verdade e grava o retrato em `stock_consumptions.items_consumed`
- O log de consumo aparece dentro do painel da Geladeira, com o texto do pedido original e os itens/quantidades usados

### 7.5 Ingestão de nota fiscal (texto)
- Usuário sobe um `.md`/`.txt` (a UI lê o arquivo no browser via `FileReader`, não há upload multipart)
- `nota-fiscal.js` extrai, via Claude + `tool_choice` forçado, só os itens de alimentação/cozinha (filtra limpeza, higiene, etc.), normaliza quantidade (ex: "2 pacotes de 5kg" → `10 kg`) e categoriza `state`+`storage`
- Cada item extraído vira uma linha em `pantry_items` (`source: 'nota_fiscal'`) e uma linha em `receipt_items` (já `confirmed: true` — sem tela de revisão nesta versão)
- Gera uma trace própria (`ingerir-nota-fiscal`) no Langfuse

### 7.6 Eixos ao vivo
- `promptVersion` (v1/v2) e `model` (`claude-sonnet-5`/`claude-haiku-4-5`/`claude-opus-5`) são estado em memória do processo Express (`currentConfig`), trocáveis via `POST /api/config` sem restart
- Toda sugestão nova usa o eixo ativo no momento da chamada

## 8. Requisitos não-funcionais

- **Segurança de custo**: qualquer deploy público **precisa** de `APP_USER`/`APP_PASSWORD` (Basic Auth) — a app usa chaves reais e pagas (Anthropic/Supabase/Langfuse) sem nenhum outro limite de taxa. Isso é requisito, não opcional, documentado como tal em `server.js`.
- **Observabilidade**: nenhuma chamada ao Claude (loop principal, chamada forçada, ou extração de nota fiscal) pode acontecer fora de uma observação do Langfuse. Isso é uma invariante de código, não uma feature — é o motivo do produto existir.
- **Segredos**: nunca versionados, nunca colados em chat/e-mail; recriados por máquina a partir dos dashboards de origem (documentado em `CLAUDE.md`).
- **Portabilidade de contexto**: o estado do projeto precisa sobreviver a troca de máquina/sessão — daí a existência do `CLAUDE.md` versionado junto com o código, em vez de depender só de memória de sessão do assistente.

## 9. Decisões de arquitetura e por quê

1. **`tool_choice` forçado em vez de confiar no prompt**, usado duas vezes (`registrar_itens_usados` no `agent.js`, extração inteira no `nota-fiscal.js`) — ver §11.3. Padrão intencionalmente repetido: uma vez que a lição apareceu, virou convenção do projeto.
2. **`storage` como eixo ortogonal a `state`**, não substituindo — um item muda de `state` (base → preparado) sem nunca mudar de `storage`. Modelar como um único campo teria colapsado dois conceitos diferentes.
3. **Sem tela de revisão de nota fiscal nesta versão**, apesar do schema (`receipt_items.confirmed`) já prever uma. Decisão consciente de escopo: o pedido explícito era "receber o arquivo e atualizar a despensa", não construir o fluxo de revisão completo — a tabela fica pronta pra quando isso for retomado.
4. **Tema fixo, não reativo a `prefers-color-scheme`**. Tentativa inicial reagia ao tema escuro do SO e produzia uma página inteira verde-escura ilegível — decisão revertida para um tema único e proposital, com uma única área (o "stage") deliberadamente escura.
5. **Preferências não são um objeto interativo da cozinha.** Existiam como um terceiro objeto (bloco de notas) na primeira versão da UI; removido a pedido explícito porque não havia caso de uso real pra essa separação física — preferências é configuração, não uma ação da cozinha. Motivo formal: nenhuma pergunta "por que separei isso" tinha resposta melhor que "porque geladeira e livro tinham objeto, então preferências também precisava".
6. **Ilustrações reais (não CSS) para geladeira e livro**, com verificação de proveniência antes de usar (geradas pelo próprio usuário, licença própria) — CSS drawing foi a primeira versão, substituída porque não sustentava a ambição estética pedida.
7. **Railway em vez de self-host** para o deploy público — decisão de custo/tempo (free tier cobre o uso, CLI simples, domínio custom fácil), não uma avaliação extensa de alternativas.

## 10. Fluxo de uma sugestão (para debugging/aula)

```
POST /api/sugestao
  → insere meal_requests
  → agent.js: sugerirReceita()
      → agent span (Langfuse)
      → loop (até 5x): chamada-claude (generation)
          → se tool_use: consultar_estoque / consultar_preferencias / registrar_itens_usados
              → cada uma e' um tool span
      → se saiu do loop sem registrar_itens_usados E consultou estoque:
          → forcar-registro-consumo (generation extra, tool_choice forcado)
  → insere meal_suggestions (com items_used, se houver)
  → resposta ao browser
```

## 11. Aprendizados empíricos incorporados como restrições

Esta seção é o motivo deste documento existir. Cada achado abaixo começou como um bug ou uma surpresa durante a construção — e cada um virou uma restrição de design real, não só uma observação de rodapé.

### 11.1 Hipótese de causa-raiz que não se confirmou
**Observação:** a expectativa de design era que o prompt v1 (solto, não obriga tool use) levaria o Claude a responder sem consultar estoque/preferências, produzindo uma trace "vazia" de tool calls — o sinal visual óbvio pra Aula 4.
**O que aconteceu:** em teste real (Claude Sonnet 5), tanto v1 quanto v2 chamaram as ferramentas normalmente.
**Restrição derivada:** o exercício de diagnóstico da Aula 4 não pode depender de um bug garantido por prompt solto — precisa ensinar a **descartar** hipóteses tanto quanto confirmá-las. Ficou como conteúdo real, não corrigido.
**Onde:** `prompts.js` (comentário no topo do arquivo).

### 11.2 Lag de ingestão do Langfuse Cloud
**Observação:** uma trace com log `"Export succeeded"` ainda retornava 404 na API pública do Langfuse.
**Diagnóstico:** confirmado via `DiagConsoleLogger` do OTel + polling — não é bug da instrumentação, é o tempo real de processamento do Langfuse Cloud antes do trace ficar consultável.
**Restrição derivada:** **~45 segundos** de latência entre "enviado" e "consultável" é esperado e deve ser ensinado como tal — qualquer automação que dependa de ler uma trace logo após criá-la precisa desse buffer.

### 11.3 Prompt não é garantia estrutural (a lição que virou padrão do projeto)
**Observação:** o prompt v2 *obriga em linguagem natural* a chamada de `registrar_itens_usados` sempre que a receita usa estoque. Na prática, o Claude regularmente escrevia a receita com quantidades específicas e simplesmente não chamava a ferramenta.
**Restrição derivada:** pedir em linguagem natural não é garantia — só o parâmetro de API (`tool_choice: {type:'tool', name:...}`) é. Corrigido no código, não no prompt: se o estoque foi consultado mas nada foi registrado, o `agent.js` força uma chamada extra fora do fluxo natural do prompt.
**Consequência de design:** o mesmo padrão foi reaplicado deliberadamente em `nota-fiscal.js` para a extração inteira — não é mais um pedido, é o desenho padrão do projeto pra qualquer saída estruturada que o produto **depende** de receber.
**Onde:** `agent.js` (bloco após o loop principal), `nota-fiscal.js` (chamada única).

### 11.4 Truncamento por `max_tokens` insuficiente — degradou de cosmético pra crash real
**Observação original:** uma sugestão de receita terminava visivelmente cortada no meio de uma palavra formatada (`⚠️ **Fa`).
**Diagnóstico original:** confirmado via API pública do Langfuse — a `generation` correspondente tinha `output tokens == 1024`, exatamente o teto configurado em `agent.js`. Não é aleatório: é a assinatura padrão de truncamento por orçamento de tokens.
**Restrição derivada:** ao inspecionar uma resposta cortada em produção, o primeiro diagnóstico correto é comparar tokens de saída com o `max_tokens` configurado — se forem iguais, é teto, não é outro tipo de falha. Fica documentado como o exemplo canônico de "padrão de falha" pra Aula 3.

**Atualização de 2026-08-12 — o mesmo achado, agora mais grave:** com a despensa real bem maior (semanas de uso acumulado via Telegram/Kanban), o teto de 1024 passou a cortar respostas do v2 **no meio de uma chamada de ferramenta** (`registrar_itens_usados`), não só no meio de uma palavra. Como `response.stop_reason` vira `max_tokens` em vez de `tool_use`, o loop em `agent.js` (`if (response.stop_reason !== 'tool_use') break;`) nunca processa esse `tool_use` truncado — ele fica órfão, sem `tool_result` correspondente. O bloco de `tool_choice` forçado (§11.3) então empilha uma mensagem nova em cima dessa conversa já inconsistente, e a Anthropic rejeita a chamada inteira com `400: tool_use ids were found without tool_result blocks`. Reproduzido ao vivo, trace `57debf7a71533fdc6a9e7a982595ba7c` (v2, Sonnet 5) — mesma causa raiz do achado original, consequência agora estrutural, não só estética.
**Status:** achado preservado **de propósito**, correção (aumentar `max_tokens`) ainda **não aplicada** — decisão explícita do instrutor em 2026-08-12: manter como está e usar a reprodução ao vivo como conteúdo real de aula (observabilidade: diagnosticar pelo trace; evals: falha estrutural que precede qualquer avaliação de qualidade; conformidade: risco conhecido, aceito e documentado, não escondido).

### 11.5 Segredo corrompido por saída de log inesperada (achado operacional, não de produto)
**Observação:** ao extrair `APP_PASSWORD` do `.env` para configurar no Railway via `stdin`, o valor chegou corrompido — 84 caracteres em vez de 12.
**Diagnóstico:** o `dotenv` v17 escreve um banner de log no mesmo stdout usado para o pipe do segredo; o banner ficou concatenado na frente do valor real.
**Restrição derivada:** nunca extrair um segredo de um processo Node via stdout sem isolar exatamente a variável (ler o arquivo `.env` diretamente com `fs`, não via `require('dotenv').config()` + `process.env`, quando o destino é um pipe).

### 11.6 Erro engolido em silêncio por fallback defensivo (`|| []`)
**Observação:** `GET /api/kanban` (v3) agregava várias queries em paralelo; cada uma tinha um `.then((r) => r.data || [])` "defensivo". Quando uma coluna nova (`trade_off_decisions.porcionado_em`) ainda não existia no banco (migração pendente), a query falhava — mas o fallback transformava o erro em `[]`, e a coluna do Kanban simplesmente aparecia vazia, sem nenhum sinal de que algo tinha quebrado.
**Diagnóstico:** só apareceu porque o teste (Playwright, local) comparou o resultado esperado (uma proposta recém-criada) contra o estado real e não bateu — sem esse teste ponta-a-ponta, o bug ficaria invisível indefinidamente, disfarçado de "ainda não tem nada aqui".
**Restrição derivada:** fallback silencioso (`|| []`, `|| null`, `try/catch` vazio) em código que agrega múltiplas fontes é o oposto do que o produto defende (§8, "Observabilidade"). Corrigido para todo erro de query propagar de verdade (`server.js`, helper `semSilencio`) — a rota responde 500 com a mensagem real em vez de fingir que está tudo bem. Vale como o sexto exemplo de "padrão de falha" pra Aula 3, e é o contra-exemplo direto do §11.1: aqui a hipótese de bug *era* verdadeira, e só apareceu por testar de ponta a ponta, não por inspeção de código.
**Onde:** `server.js` (`GET /api/kanban`, `GET /api/config-quantitativo`).

## 12. Limitações conhecidas e trabalho futuro

- **Vision para nota fiscal**: hoje só ingere texto/markdown. O terceiro eixo trocável planejado (fable-5/haiku-4-5 para visão) não existe ainda.
- **Sem tela de revisão de nota fiscal**: `receipt_items.confirmed` é gravado direto como `true`; a UX de "revisar antes de confirmar" prevista no schema não foi construída.
- **Pipeline de evals (Aula 2)**: nenhum Score é escrito de volta no Langfuse ainda. Bloqueia conteúdo real de "qualidade ao longo do tempo" na Aula 3.
- **`max_tokens` truncando respostas** (§11.4) — achado preservado, não corrigido; desde 2026-08-12 pode derrubar a requisição inteira no v2 (não só cortar texto), risco aceito de propósito como conteúdo de aula ao vivo.
- **Sem testes automatizados nem CI.**
- **Household único, sem autenticação real de usuário** — aceitável para o escopo do curso, não seria pra um produto real.

## 13. v3 "Musa Balance" — pivot multi-ator e redesenho em Kanban

Tudo que segue foi construído em 2026-08-02, na mesma sessão, e muda o produto mais do que qualquer mudança anterior — por isso ganha seção própria em vez de ser espalhado pelas seções 1–12 (que continuam descrevendo o Chef Ops v1/v2 com precisão, porque ele **continua existindo**, só sem UI).

### 13.1 Motivação

Chef Caseiro v1 foi julgado, pelo próprio instrutor, conceitualmente raso: "gestor de estoque com chat acoplado". Faltava conflito real — o ingrediente que produz trace interessante pra ensinar diagnóstico não é um bug de prompt, é uma decisão com trade-off de verdade. O pivot nasce de um problema doméstico real do instrutor: ele (chef, cuida de saúde/sustentabilidade/orçamento) e a esposa (musa, traz o desejo e o prazer gastronômico) competem pelo mesmo recurso — a decisão do que a casa vai comer. A partir daqui o produto serve **dois propósitos simultâneos**: modelo de aula e ferramenta real da casa do instrutor, com dado de produção genuíno (não simulado) alimentando os dois.

### 13.2 Camada determinística vs. probabilística (a regra de ouro herdada)

Princípio central, mantido do zero: **o Claude nunca calcula prazo, decaimento ou matemática financeira** — isso é sempre função em código, exposta pro modelo só como resultado de tool. É a mesma lição do §11.3 (prompt não é garantia estrutural), agora generalizada de "não confiar em pedido" pra "não confiar em cálculo". Exemplos concretos: a regra D-6 de branqueamento virou `households.dias_validade_pos_branqueamento`, um número editável em vez de constante fixa no código; o orçamento semanal é somado em `consultar_orcamento_semanal`, nunca estimado pelo modelo.

### 13.3 Atores e canal Telegram

- **`actors`**: substitui a casa como bloco indiferenciado por duas identidades reais (`chef`/`musa`), cada uma ligada a um `telegram_user_id`.
- **Onboarding por botão, não comando decorado**: a primeira mensagem de um `telegram_user_id` desconhecido faz o bot perguntar quem é, com teclado inline — decisão tomada depois que o fluxo original (`/eusou_chef`) gerou atrito real de UX ("estou sofrendo com a UX do Telegram").
- **Reação silenciosa em sucesso, mensagem só em erro ou pergunta real**: decisão explícita depois do instrutor apontar que o bot "parece um estranho no meio do debate do casal" comentando cada interação. Captura de relato/desejo/aquisição vira só uma reação (👍/🤔) na própria mensagem; falha continua barulhenta de propósito (nunca falhar em silêncio, §8). **Achado técnico**: a API de reação do Telegram só aceita um conjunto fixo de emojis — não dá pra usar qualquer emoji livre como em texto, teclado precisa ser removido explicitamente da mensagem depois do toque (`editMessageText` com `reply_markup` vazio), senão fica clicável pra sempre.
- **Atribuição de orçamento por pergunta ativa**: uma aquisição sem "paguei com X" no texto já estoca o item na hora (fisicamente já está na casa) mas fica com `status: 'aguardando_categoria'` até o bot perguntar (3 botões: TR Diego / TR Esposa / Crédito Família) e a resposta resolver o registro — bookkeeping nunca trava o fluxo físico do estoque.

### 13.4 O Kanban — pipeline físico do alimento, não CRUD por tipo de tela

Reformulação central do produto: o painel deixou de ser "lugar de digitar dado" (o bot já captura) e virou "lugar de observar e decidir sobre um pipeline". Chegou nesse formato por várias rodadas de debate, cada uma corrigindo uma suposição inicial errada — vale registrar o raciocínio, não só o resultado:

1. **"Estocar" foi removido do pipeline.** A primeira proposta tinha 5 estágios (Adquirir → Estocar → Pré-preparo → Preparo → Porcionamento). Mas no código, adquirir e estocar **já são o mesmo evento**: tanto a nota fiscal quanto o chat gravam o item já categorizado (`state`+`storage`) numa escrita só — nunca existiu confirmação humana separada de "guardei mesmo". Manter Estocar como estágio seria inventar uma etapa que o produto nunca teve, só pra preencher uma coluna.
2. **Despensa não é estágio, é função separada, fora do Kanban.** Um Kanban de verdade tem WIP pequeno por definição — empilhar a despensa inteira (potencialmente dezenas de itens) como "trabalho em andamento" reproduziria o mesmo erro já corrigido uma vez no v1 (§7.1: lista plana de +15 itens virou ilegível). A correção usa a mesma lição: Despensa é uma grade densa (Geladeira/Despensa por `storage`, herdada do v1), só itens ainda não `preparado`, acessada sob demanda — não faz parte do fluxo ativo.
3. **Fronteira "item" → "receita" (story vs. feature) acontece em Preparo.** Até Preparo, um card é um item atômico (arroz, guanciale). Uma receita é composta — "empacota" vários itens, igual um epic empacota stories. Ao ser reclamada por uma decisão de cardápio, o item some do quadro como card próprio (estoque decrementa de verdade) e devia reaparecer como linha dentro do card da receita — mesmo padrão que `meal_suggestions.items_used`/`stock_consumptions.items_consumed` já usam desde o v1, reaplicado, não reinventado.
4. **Plano Semanal é o backlog, e carrega duas fontes de demanda em tensão.** "Planejamento funcional" (o que a nutricionista recomendaria — calorias controladas, marmitas repetíveis) e "planejamento emergente" (o desejo do momento — premium, ingrediente, história) competem pelo mesmo espaço no backlog. É a mesma tensão fundadora do produto (chef vs. musa), agora modelada como as duas origens de card na mesma coluna, em vez de ficar só como narrativa.
5. **Porcionamento e Consumo são a mesma tabela, dois recortes — e é aí que mora o valor real.** `pantry_items` com `state='preparado'`: `portions_remaining == portions_total` é lote intocado (Porcionamento); `0 < portions_remaining < portions_total` é lote em uso (Consumo). São populações de card diferentes, não o mesmo estado com nome trocado — só faz sentido cobrar atenção sobre um lote que já começou a ser consumido, não sobre um intocado. É exatamente aí que a "pior derrota" do produto (pedir McDonald's enquanto duas marmitas caseiras ficam esquecidas até vencer) fica **observável como dado**, não só como narrativa de missão.
6. **Validade de prato pronto é aprendida, não configurada.** Diferente do branqueamento (uma regra D-N razoavelmente universal), cada prato decai no próprio ritmo — não dá pra globalizar. Em vez de inventar uma constante por prato, a validade fica como dado bruto capturado no relato de desperdício (`pantry_items.prepared_at` + `pensamentos.dias_desde_preparo`, calculado em código a partir da correspondência com o item). **Sem nenhum consumidor ainda** — é o primeiro passo concreto de LTM que o produto ganhou, deliberadamente não conectado a nada até existir critério de sucesso definido (mesma cautela que adiou LTM geral desde o pivot original).
7. **Drag-and-drop manual E atualização automática via bot escrevem no mesmo dado, de propósito.** Não foi decisão por omissão — foi escolha explícita do instrutor depois de eu levantar o risco de divergência: *"o ótimo aqui é fazer o produto quebrar e apresentar em sala de aula"*. Coerente com a razão de o produto existir (§1): produzir trace real e defeituoso, não perfeito.
8. **A tensão delivery-vs-porção-envelhecendo é comentada pelo Mediador por instrução de prompt, nunca por regra determinística forçada.** Existe uma tool de leitura (`consultar_relatos_recentes`) e uma frase no prompt pedindo pra notar o padrão — sem `tool_choice` forçado, de propósito. Forçar aqui removeria a chance real de o agente ignorar a orientação, que é exatamente o tipo de conteúdo pedagógico que o §11.1 já provou valer mais que um bug garantido.

### 13.5 v1/v2 retirado da interface, preservado no código

Decisão consciente, tomada cientes de que contraria o que este documento (e o `CLAUDE.md`) registravam antes como compromisso ("v1/v2 continuam existindo sem alteração"): a superfície web de "Pedir sugestão" saiu do painel, porque o Kanban não tem um estágio físico honesto pra esse fluxo (não é "preparo" no sentido do pipeline, é uma ferramenta de aula). `agent.js:sugerirReceita`, `prompts.js` (v1/v2) e as rotas `/api/sugestao`/`/api/sugestoes` continuam funcionais e intactas — o comparativo de eixos da Aula 4 passa a ser demonstrado via Postman/curl, não mais por um botão no dashboard do dia a dia.

### 13.6 Modelo de dados v3 (adições sobre a tabela do §6)

| Tabela/coluna | Papel |
|---|---|
| `actors` | os dois atores reais (`chef`/`musa`), ligados a `telegram_user_id` |
| `weekly_budgets` | teto calórico/financeiro da semana, por household |
| `actor_daily_targets` | meta calórica diária + macros por ator — macros travados até nutricionista real orientar |
| `meal_reports` | relato de refeição, com `fonte_refeicao` (caseira/delivery/restaurante) e `budget_categoria` |
| `trade_off_decisions` | proposta + escolha do Agente Mediador; `porcionado_em` marca quando virou prato pronto de verdade |
| `pensamentos` | log cru de tudo que o Agente de Ingestão classificou — `tipo` em `relato_refeicao/desejo/aquisicao/desperdicio`, com `budget_categoria`, `status` (`aguardando_categoria` até o bot perguntar), `fonte_refeicao`, `dias_desde_preparo` |
| `pantry_items.blanched_at` | timestamp de branqueamento — base do decaimento D-N |
| `pantry_items.portions_total`/`portions_remaining` | porcionamento; a diferença entre os dois separa Porcionamento de Consumo |
| `pantry_items.prepared_at` | quando o item virou `preparado` — base da validade aprendida (§13.4.6) |
| `households.dias_validade_pos_branqueamento` | D-N editável, substitui constante fixa em código |
| `households.telegram_chat_id` | aprendido sozinho na primeira mensagem do grupo |

### 13.7 Rotas novas

`/api/atores`, `/api/relatos`, `/api/pensamentos`, `/api/orcamento-semanal`, `/api/mediacao`, `/api/mediacoes`, `/api/telegram/webhook` (autenticado por `TELEGRAM_WEBHOOK_SECRET`, não pelo Basic Auth geral — o Telegram não manda credenciais), `/api/kanban` (agregação dos 5 estágios ativos), `/api/kanban/acao` (`branquear`/`porcionar`/`consumir` — `porcionar` é sempre manual, só quem cozinhou de verdade sabe o rendimento), `/api/config-quantitativo` (+ `/validade`, `/metas`).

### 13.8 Adiado de propósito, não esquecido

Cards com swipe + geração de imagem por IA (mecânica de UI validada como barata via bibliotecas prontas, mas a geração de imagem em si continua cara — registrado como desejo no roadmap, não compromisso desta fase); LTM/aprendizado geral de "match de sucesso" (a validade de prato pronto do §13.4.6 é o primeiro passo concreto, ainda sem consumidor); RLS/multi-tenancy (desnecessário pra uma casa real única — só `SUPABASE_SERVICE_ROLE_KEY` toca essas tabelas, nunca o browser, então o aviso do linter do Supabase não se aplica aqui).

## 14. v4 "Feed vivo" — a morte do Kanban (2026-08-21)

### 14.1 O que aconteceu

Dezenove dias depois de nascer, o Kanban da fase 4 (§13) foi **removido por decisão explícita do instrutor**, junto com o diagnóstico de por quê: a estrutura de 5 estágios exigia que a vida da casa produzisse eventos em formato de pipeline, e ela não produz — as colunas Porcionamento/Consumo ficaram cronicamente vazias, o drag só fazia sentido entre 2 das 5 colunas, e as outras transições eram botões porque cada uma dependia de dado que só um humano tem. O gatilho foi um bug report ("o drag não funciona") cujo diagnóstico revelou que o problema não era o drag: era a metáfora. Nas palavras do instrutor, dez anos olhando pipelines de Azure DevOps bastaram.

Este capítulo é deliberadamente mantido como conteúdo de aula sobre produto: construímos a estrutura rigorosa, a realidade não a alimentou, e matá-la — em vez de "consertar o drag" — foi a solução elegante. Elegância aqui definida operacionalmente: **a interface tem o mesmo grão que os dados**. O grão real é evento no tempo, e a tabela central (`pensamentos`) sempre foi um feed esperando pra ser a tela.

### 14.2 O que entrou no lugar

- **Faixa de estado derivado** (`GET /api/estado-cozinha`) — o único pedaço do Kanban que pagava aluguel (estado de relance) sobrevive como 3 cartas só-leitura: porções vivas, vencendo (D-N), saldo da semana. Tudo matemática em código; a convenção `semSilencio` (§13, achado do fallback `|| []`) migrou junto.
- **Feed** — `pensamentos` em ordem cronológica reversa, com filtro por ator. Desejo ganha botão de mediação (`/api/mediacao`, inalterada).
- **Conversa** (`POST /api/conversa`) — canal web do **caminho único de escrita**: `intencao-efeitos.js` (`aplicarIntencao`). A divergência intencional entre web e bot da era do Kanban morreu junto com ele; agora Telegram e web classificam com o mesmo agente de ingestão e aplicam efeitos no mesmo módulo.
- **Dois tipos novos de pensamento** — `branqueamento` e `porcionamento` substituem as ações de coluna. A regra "porcionar é sempre manual" sobrevive **melhor** na conversa: porcionamento sem número dito retorna `pergunta` (o sistema pergunta, nunca estima) e não grava nada até a resposta vir completa.
- **Eixo de custo novo** (`modelIngestao`, default `claude-haiku-4-5`) — a classificação conversacional roda no modelo barato; `model` segue sendo o eixo de geração (Mediador, nota, receita premium). Comparar o custo dos dois eixos no Langfuse é material novo de aula.

### 14.3 O que morreu e o que ficou

Mortas: `/api/kanban`, `/api/kanban/acao`, `/api/relatos` (substituída por `/api/conversa`), o board inteiro no front, a legenda bot/manual (existia pra explicar a divergência de caminhos, que não existe mais). Vivas e intocadas: v1/v2 do Chef Ops, todos os achados do §11, `trade_off_decisions` (o Mediador segue registrando), a Despensa como objeto, e o botão "branquear" da despensa (rebatizado `/api/estoque/:id/branquear` — era a única ação do Kanban que já morava na tela certa).

## 15. Como usar este documento

Este documento descreve o que existe, não prescreve como reconstruir. Se o objetivo agora é reconstruir com as próprias mãos: use as seções 5–8 como mapa do Chef Ops original (v1/v2, ainda funcional sob o feed), a seção 13 como mapa do pivot v3, a seção 14 como o registro de por que o Kanban da 13 não sobreviveu, e a seção 11 como a lista de decisões que **não são óbvias na primeira tentativa** — cada uma delas só existe porque a primeira versão ingênua falhou de um jeito específico. Reproduzir o produto sem essas restrições provavelmente reproduz os mesmos problemas.
