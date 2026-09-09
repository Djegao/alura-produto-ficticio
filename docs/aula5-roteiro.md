# Aula 5 — Guardrails, transparência e LGPD

Versão do produto: **`master`**, tour de código — sem deploy, sem checkout
de branch. Ver mapa geral em
[`PLANO-GRAVACAO-CURSO.md`](./PLANO-GRAVACAO-CURSO.md). Esta aula tem
**6 vídeos** (5.1–5.6), não 4 — confira a tabela em
`PLANO-GRAVACAO-CURSO.md` antes de gravar.

---

## 5.1 — O que são guardrails? (tempo não informado no CSV)

**Objetivo:** entender o que são guardrails em produtos com IA: limites
operacionais que definem o que o produto pode e não pode fazer, protegendo
usuários e a empresa.

**Fala sugerida (bullets) — cinco guardrails reais do código, não
hipotéticos:**
1. **`tool_choice` forçado pra saída estruturada crítica** — já visto nas
   aulas 2 e 3 (`agent.js`, `nota-fiscal.js`, o juiz da Aula 2). Aqui o
   enquadramento muda: não é só qualidade, é guardrail — o produto **não
   confia** em pedir por linguagem natural quando a saída importa.
2. **Validação de domínio + formato antes de confiar num dado externo**
   (`sefaz.js`) — só aceita URL com domínio `.gov.br` **e** chave de 44
   dígitos antes de sequer tentar buscar. Rejeita silenciosamente qualquer
   outra coisa antes de gastar uma chamada de rede ou LLM nela.
3. **"Perguntar em vez de chutar" como guardrail de produto, não só de
   prompt** (`intencao-efeitos.js`) — porcionamento sem número dito nunca
   vira estimativa; volta como `pergunta` no retorno, e nada é gravado até
   a resposta vir completa. É a mesma regra de ouro do projeto ("Claude
   nunca calcula", SDD §13.2) aplicada a "Claude nunca estima quantidade
   não dita".
4. **Guarda-corpo de URL na receita premium** (`receita-premium.js`) — a
   única decisão da LLM é escolher qual vídeo do canal casa com o
   estoque/preferências, mas o guardrail em código confere se a URL
   devolvida **existe de fato no feed RSS** antes de postar — se não
   existir, erro, não uma URL inventada indo pro Telegram do usuário.
5. **Basic Auth como guardrail de custo**, não só de acesso —
   `APP_USER`/`APP_PASSWORD`; sem eles, roda aberto (aceitável só em
   localhost). É requisito documentado em `SDD.md §8`, não opcional.

**Demo:**
1. Abrir `agent.js`, mostrar o bloco de `tool_choice` forçado depois do
   loop.
2. Abrir `sefaz.js`, mostrar a validação de domínio + regex da chave de 44
   dígitos.
3. Abrir `intencao-efeitos.js`, mostrar o retorno com campo `pergunta`
   quando não há número dito.
4. Abrir `receita-premium.js`, mostrar o guarda-corpo que confere a URL
   contra o feed antes de postar.

**Slides — outline:**
1. **"O que é um guardrail"** — bullets: limite operacional, não feature;
   protege usuário e empresa; é código, não é intenção.
2. **Cinco guardrails reais** — um bullet por item da lista acima, cada
   um com o nome do arquivo.
3. **O fio comum** — "nenhum desses confia em pedir por linguagem natural
   quando a saída importa" — reconecta com o achado §11.3 já visto nas
   aulas anteriores.

**Se der errado:** sem dependência técnica — é leitura de código, sem
terminal.

---

## 5.2 — Transparência com o usuário (tempo não informado no CSV)

**Objetivo:** aprender o que comunicar ao usuário sobre o uso de IA no
produto (quando, como e por quê) de forma clara, honesta e alinhada às
boas práticas do mercado.

**Fala sugerida (bullets):**
- Transparência não é um aviso legal genérico — é o produto dizer, no
  momento certo, o que ele sabe fazer e o que não sabe.
- O exemplo mais concreto do curso inteiro: o episódio B do Telegram
  (Aula 4). Antes do PR #4, uma foto de cupom enviada ao bot **não gerava
  resposta nenhuma** — nem log, nem trace, nem mensagem. Depois do fix, o
  bot responde: **"ainda não sei ler foto de cupom, me manda o link do QR
  ou o texto"**.
- O ponto pedagógico central, direto do runbook: **admitir a limitação já
  é uma correção**. O bug real não era "não saber ler foto" — sistemas têm
  limite, tudo bem. O bug era **não dizer** que não sabia.
- Generalizar: toda resposta "não sei fazer isso" é mais transparente — e
  mais barata de construir — que fingir que processou algo que não
  processou.

**Demo:**
1. Abrir `telegram.js` na branch `master` (estado atual, ainda sem o fix) e
   mostrar o `return` mudo comentado no roteiro da Aula 4
   (`docs/aula4-roteiro-falha-telegram.md`) — **sem aplicar o fix aqui**,
   é só leitura, o fix é ato da Aula 4.
2. Ler em voz alta o trecho do runbook: "admitir a limitação já é uma
   correção — o bug não era não saber ler, era não dizer."

**Slides — outline:**
1. **"Transparência não é aviso legal"** — bullets: é comportamento do
   produto, não texto de rodapé; acontece no momento da limitação, não
   antes dela.
2. **O caso real: a foto do cupom** — antes (silêncio total) / depois
   ("ainda não sei ler foto de cupom...") lado a lado.
3. **"Admitir já é corrigir"** — a frase do runbook como slide de
   destaque.

**Se der errado:** sem dependência técnica — reusa conteúdo já documentado
no roteiro da Aula 4, sem precisar reproduzir o bug ao vivo aqui.

---

## 5.3 — LGPD na prática (tempo não informado no CSV)

**Objetivo:** identificar as obrigações práticas da LGPD aplicadas a
produtos com IA: quais dados são coletados, como são usados e o que o
produto precisa garantir ao usuário.

**Fala sugerida (bullets) — dados reais e sensíveis que o produto coleta:**
- `telegram_chat_id` e `telegram_user_id` — identificam pessoas reais em
  uma conversa real, ligados a `actors` (chef/musa).
- `pensamentos` — o log cru de tudo que os dois atores conversam sobre
  comida em casa: o que comeram, o que desejam, quanto gastaram. Isso é
  **dado de rotina familiar** — não é dado financeiro nem de saúde no
  sentido estrito, mas é íntimo o suficiente pra merecer o mesmo cuidado.
- O que o produto **não** tem hoje, honestamente: RLS (Row Level Security)
  está **desligado de propósito** no Supabase — a proteção real é que só o
  `SUPABASE_SERVICE_ROLE_KEY` toca essas tabelas, nunca o browser
  (documentado em `CLAUDE.md`/`SDD.md §13.8`). Isso é uma decisão
  documentada e justificada pro escopo de um household único — não seria
  aceitável assim num produto multi-tenant real.
- O Basic Auth do deploy público (`APP_USER`/`APP_PASSWORD`) funciona como
  gate de acesso, não como controle de LGPD — mas é a única barreira entre
  os dados reais da casa e qualquer pessoa que descubra a URL.
- Pergunta que fica em aberto de propósito (é a pergunta que o checklist da
  5.4 formaliza): quem tem direito de pedir a exclusão desses dados, e o
  produto tem como atender hoje?

**Demo:**
1. Mostrar `schema.sql`, apontar as colunas `telegram_chat_id` /
   `telegram_user_id` em `households`/`actors`.
2. Mostrar o trecho do `CLAUDE.md`/`SDD.md` que documenta RLS desligado e
   por quê.
3. Não abrir o Supabase com dados reais da casa em tela cheia — se for
   mostrar o dashboard, aplique zoom/crop pra não expor conteúdo real dos
   `pensamentos` (são conversas reais do instrutor com a esposa).

**Slides — outline:**
1. **"Dado sensível não é só CPF"** — bullets: rotina familiar, hábito de
   consumo, identidade em conversa privada — tudo isso é dado pessoal sob
   LGPD.
2. **O que o Chef Caseiro coleta** — lista curta: `telegram_chat_id`,
   `pensamentos`, itens de estoque ligados à casa.
3. **Onde a proteção está — e onde não está** — RLS desligado (decisão
   documentada, aceitável só no escopo atual) vs. service role key nunca
   exposta ao browser vs. Basic Auth como gate de acesso.

**Se der errado:** ao mostrar qualquer captura de tela do Supabase ou do
Telegram com dados reais da casa, corte/borre antes de gravar — não exponha
conversa real do instrutor com a esposa, mesmo em um curso sobre
transparência.

---

## 5.4 — Checklist de conformidade (tempo não informado no CSV)

Sem objetivo de aprendizagem próprio no CSV — este vídeo aponta pro
checklist prático.

**Fala sugerida (bullets):**
- Tudo que foi mostrado nos vídeos 5.1–5.3 vira um checklist aplicável a
  qualquer produto com IA, não só o Chef Caseiro.
- O checklist é honesto sobre o que falta — não é uma lista de "está tudo
  certo", é uma lista de "aqui está onde estamos, aqui está o que falta".

**Demo:**
1. Abrir [`docs/aula5-checklist-conformidade.md`](./aula5-checklist-conformidade.md)
   e percorrer a tabela, item por item, parando na coluna "como o Chef
   Caseiro está hoje".

**Slides — outline:**
1. **"O checklist"** — screenshot/tabela resumida do documento.
2. **O que está em falta, sem rodeio** — destaque pros itens honestamente
   marcados como pendentes (RLS off, sem tela de revisão, sem política de
   retenção).

**Se der errado:** sem dependência técnica — é leitura guiada de um
documento já pronto.

---

## 5.5 — O que aprendemos? (texto)

- Guardrail é limite em código, não intenção em prompt — os quatro
  guardrails reais do Chef Caseiro seguem o mesmo padrão: nunca confiar só
  em pedir.
- Transparência é o produto dizer, no momento certo, o que não sabe fazer
  — "admitir já é corrigir".
- LGPD em produtos com IA começa em identificar que dado de rotina (uma
  conversa sobre o jantar) também é dado pessoal — e em documentar
  honestamente onde a proteção existe e onde ainda não existe.
- O checklist de conformidade formaliza os três pontos acima como algo
  aplicável a qualquer produto, não só a este.

---

## 5.6 — Conclusão (tempo não informado no CSV)

Sem objetivo de aprendizagem próprio no CSV — é o fechamento do curso
inteiro, amarrando os três pilares.

**Fala sugerida (bullets):**
- Voltar ao gancho da Aula 1: "lançar é o começo, não o fim" — agora com
  conteúdo real por trás de cada pilar.
- **Evals** (Aula 2): critério mensurável + Claude-as-judge com saída
  forçada, resultado gravado como Score no Langfuse.
- **Observabilidade** (Aulas 3 e 4): trace real, dado de custo real,
  quatro padrões de falha reais detectados e — em pelo menos um caso —
  corrigidos ao vivo, sem esconder o que ainda ficou como risco aceito
  (`max_tokens`, match de nome).
- **Conformidade responsável** (Aula 5): guardrail em código, transparência
  como comportamento, LGPD como prática, não como rodapé.
- Fechamento: nenhum dos três pilares funciona sozinho — o eval que não
  vira dado observável não gera aprendizado; a observabilidade sem
  guardrail vira incidente; o guardrail sem eval nunca sabe se está
  funcionando. O produto que o aluno acabou de ver por dentro rodou —
  errou, foi corrigido, errou de novo — com os três juntos.

**Demo:** nenhuma — fechamento em slide, sem terminal.

**Slides — outline:**
1. **"Os três pilares, com conteúdo real"** — reusar o diagrama da Aula 1,
   agora preenchido com o que cada aula realmente mostrou.
2. **O que o Chef Caseiro provou** — bullets: bug real corrigido ao vivo
   (Telegram), bug real preservado por decisão consciente (match de nome),
   custo real medido e comparado (haiku vs. sonnet).
3. **Encerramento** — convite pra aplicar o mesmo ciclo no produto do
   próprio aluno.

**Se der errado:** sem dependência técnica.
