# Chef Caseiro — Especificação (SDD)

**Versão documentada:** estado do `master` em 2026-08-02
**Status:** produto fictício funcional, em uso ativo como base da Aula 4 (e apoio às Aulas 2/3) do curso Alura *"Evals, observabilidade e conformidade"* (formação AI Product Builder).
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

1. **A casa (usuário final fictício)** — quem interage com estoque/preferências/sugestões dentro da narrativa do produto.
2. **O instrutor (operador real)** — quem manipula os eixos ao vivo durante a gravação, olha o Langfuse, e precisa que o produto falhe de forma **legível**, não silenciosa.

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

### 11.4 Truncamento por `max_tokens` insuficiente
**Observação:** uma sugestão de receita terminava visivelmente cortada no meio de uma palavra formatada (`⚠️ **Fa`).
**Diagnóstico:** confirmado via API pública do Langfuse — a `generation` correspondente tinha `output tokens == 1024`, exatamente o teto configurado em `agent.js`. Não é aleatório: é a assinatura padrão de truncamento por orçamento de tokens.
**Restrição derivada:** ao inspecionar uma resposta cortada em produção, o primeiro diagnóstico correto é comparar tokens de saída com o `max_tokens` configurado — se forem iguais, é teto, não é outro tipo de falha. Fica documentado como o exemplo canônico de "padrão de falha" pra Aula 3.
**Status:** achado preservado, correção (aumentar `max_tokens`) ainda **não aplicada** — decisão pendente do instrutor.

### 11.5 Segredo corrompido por saída de log inesperada (achado operacional, não de produto)
**Observação:** ao extrair `APP_PASSWORD` do `.env` para configurar no Railway via `stdin`, o valor chegou corrompido — 84 caracteres em vez de 12.
**Diagnóstico:** o `dotenv` v17 escreve um banner de log no mesmo stdout usado para o pipe do segredo; o banner ficou concatenado na frente do valor real.
**Restrição derivada:** nunca extrair um segredo de um processo Node via stdout sem isolar exatamente a variável (ler o arquivo `.env` diretamente com `fs`, não via `require('dotenv').config()` + `process.env`, quando o destino é um pipe).

## 12. Limitações conhecidas e trabalho futuro

- **Vision para nota fiscal**: hoje só ingere texto/markdown. O terceiro eixo trocável planejado (fable-5/haiku-4-5 para visão) não existe ainda.
- **Sem tela de revisão de nota fiscal**: `receipt_items.confirmed` é gravado direto como `true`; a UX de "revisar antes de confirmar" prevista no schema não foi construída.
- **Pipeline de evals (Aula 2)**: nenhum Score é escrito de volta no Langfuse ainda. Bloqueia conteúdo real de "qualidade ao longo do tempo" na Aula 3.
- **`max_tokens` truncando respostas** (§11.4) — achado preservado, não corrigido.
- **Sem testes automatizados nem CI.**
- **Household único, sem autenticação real de usuário** — aceitável para o escopo do curso, não seria pra um produto real.

## 13. Como usar este documento

Este documento descreve o que existe, não prescreve como reconstruir. Se o objetivo agora é reconstruir com as próprias mãos: use as seções 5–8 como mapa do que precisa existir, e a seção 11 como a lista de decisões que **não são óbvias na primeira tentativa** — cada uma delas só existe porque a primeira versão ingênua falhou de um jeito específico. Reproduzir o produto sem essas cinco restrições provavelmente reproduz os mesmos cinco problemas.
