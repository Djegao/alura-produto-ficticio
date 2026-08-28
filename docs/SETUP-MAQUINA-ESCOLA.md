# Setup da máquina da escola — checklist cronometrado (~25 min)

Rodar **antes de apertar REC**, na máquina da escola. A máquina será
formatada depois — não se preocupe com resíduo (chaves em cache, sessão
logada, histórico de shell). Siga na ordem; cada bloco tem tempo estimado.

⚠️ **Leia o aviso no final antes de começar** — ele muda a ordem em que
você deixa abas abertas.

---

## 0. BLOQUEANTE — a chave da Anthropic precisa ser trocada

**Descoberto em 28/08 e confirmado por dois caminhos independentes: a
`ANTHROPIC_API_KEY` do projeto está revogada.** A chave do `.env` local e a
do Railway são a mesma (108 caracteres, terminando em `n_Z0QQAA`), e ambas
recebem:

```
401 authentication_error: "API key is invalid."
```

**Isso não afeta só a Aula 2 — desliga a inteligência do produto inteiro:**
Mediador, ingestão de relato pelo Telegram, leitura de nota fiscal e receita
premium. O produto sobe, o painel abre, o bot recebe a mensagem — e toda
chamada ao modelo falha. Coerente com o Langfuse: o trace mais recente é de
**24/08**.

Sem trocar a chave, **as Aulas 1, 2, 3 e 4 não têm demo ao vivo**.

**Só o Diego pode fazer isto:**

1. Gerar uma chave nova em `console.anthropic.com` → API Keys.
2. Colocar no Railway (é o que produção usa). O comando abaixo **lê a chave
   pelo stdin**, então ela não fica no histórico do shell — cole a chave,
   dê Enter e `Ctrl+Z` + Enter para encerrar a entrada:

```bash
railway variable set ANTHROPIC_API_KEY --stdin --service chef-caseiro
```

   Se preferir o caminho direto (a chave fica no histórico, e na máquina da
   escola isso é aceitável porque ela será formatada):

```bash
railway variable set ANTHROPIC_API_KEY=<chave-nova> --service chef-caseiro
```

   **Definir a variável já dispara um redeploy sozinho** — não precisa de
   `railway up` depois (a menos que você passe `--skip-deploys`). Confira em
   `railway deployment list` que entrou um deployment novo.

3. Conferir que a variável nova está lá:

```bash
railway variable list --kv
```

4. Colocar a mesma chave no `.env` local (para a Aula 2 e o antes/depois da
   Aula 3). Se já existir `.env`, edite a linha `ANTHROPIC_API_KEY=`; se
   ainda não houver, gere-o **depois** de atualizar o Railway, com
   `powershell -File scripts/observabilidade.ps1 preparar` — assim ele já
   nasce com a chave nova.
5. Conferir que voltou a funcionar, mandando uma mensagem qualquer no grupo
   do Telegram e vendo o bot responder — ou rodando:

```bash
node evals/run-evals.js --dry-run --limit 1
```

Se aparecer julgamento em vez de `401`, está resolvido. **Depois disso,
rode a rodada real de evals** (`node evals/run-evals.js --limit 5`) para ter
Scores gravados no Langfuse antes da Aula 3 — ela usa esses Scores.

---

## 0.1. Confirmar que produção está no ar

**Histórico de 28/08, para você reconhecer o sintoma se ele voltar:** na
manhã de 28/08 `chef.workshopee.com.br` respondia **404** e
`railway deployment list` mostrava **todos os deployments como `REMOVED`**
(o último, de 23/08, terminou com `SIGTERM`) — encerramento do período
gratuito do Railway. Foi **resolvido no mesmo dia**: às **10h34** entrou um
deployment `SUCCESS` e a URL voltou a responder **401** (o Basic Auth
pedindo senha). As variáveis de ambiente nunca foram perdidas.

Confirme, antes de qualquer coisa, que continua assim:

```bash
curl.exe -s -o NUL -w "HTTP %{http_code}\n" https://chef.workshopee.com.br
```

**401 = tudo certo. 404 = não há deploy ativo — pare e resolva.** Aulas 1,
3 e 4 dependem do produto no ar:

> **Escreva `curl.exe`, não `curl`.** No PowerShell, `curl` é apelido de
> `Invoke-WebRequest` e não entende as opções do curl de verdade — o
> comando falha pedindo `Uri`. Isso vale para todos os `curl` deste
> documento (testado em 28/08).

| Aula | Depende de produção como |
|---|---|
| 1 | demo do produto real rodando (1.2) |
| 3 | tráfego real chegando ao Langfuse |
| 4 | os três deploys ao vivo (master → PR #4 → PR #6) |

Se voltar a dar 404, o caminho é regularizar a conta no Railway e subir de
novo a partir de `master`:

```bash
railway up --service chef-caseiro --detach
```

Depois de qualquer redeploy, reconfira o webhook do Telegram — se ele
apontava pra um serviço que ficou fora do ar, pode ter registrado erro:

```bash
curl.exe "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

Se `last_error_message` mencionar erro de conexão, reenvie o `setWebhook`
antes de gravar a Aula 4.

**Plano B se não der pra subir a tempo:** rode tudo local com
`railway run npm start` (passo 3) e grave as demos contra `localhost`. O
que se perde: os deploys ao vivo da Aula 4 viram troca de branch + restart
local, e o Telegram não chega (webhook precisa de URL pública). Nesse
cenário, a Aula 4 usa o painel web como canal em vez do bot — mas o
episódio B (falha silenciosa da foto no Telegram) **não é reproduzível ao
vivo**; use as evidências já capturadas em
`docs/aula4-inventario-conteudo.md`.

---

## 1. Clonar o repo e instalar (≈5 min)

```bash
git clone https://github.com/Djegao/alura-produto-ficticio.git
```

```bash
cd alura-produto-ficticio && npm install
```

Conferir que a instalação terminou sem erro antes de seguir.

## 2. Railway — login, link e variáveis (≈5 min)

```bash
railway login
```

Abre o navegador — autentique com a mesma conta Railway do projeto
`chef-caseiro`.

```bash
railway link
```

Selecione, na ordem: projeto **`chef-caseiro`** → ambiente **`production`**
→ serviço **`chef-caseiro`**.

```bash
railway variable list
```

Confira que aparecem `ANTHROPIC_API_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_PUBLIC_KEY`,
`LANGFUSE_BASE_URL`, `APP_USER`, `APP_PASSWORD`, e as variáveis do
Telegram. **Anote (ou deixe o terminal aberto) o valor de `APP_PASSWORD`**
— é a senha que você vai digitar ao vivo pra entrar em
https://chef.workshopee.com.br quando o Basic Auth pedir.

## 3. Rodar local com env de produção, sem criar `.env` (≈2 min)

```bash
railway run npm start
```

Isso injeta as variáveis de produção no processo local sem gravar nenhum
arquivo `.env` na máquina da escola — nada de segredo em disco pra limpar
depois. Confirme que abre em `http://localhost:3300` sem erro no terminal.
Encerre com `Ctrl+C` quando confirmar — a demo ao vivo decide na hora se
usa local ou produção, conforme o roteiro de cada aula.

## 4. Abas e logins a deixar abertos (≈5 min)

Abra e autentique em cada um **antes** de começar a gravar (evita
interromper uma tomada pra digitar senha):

- **Langfuse Cloud** — `https://us.cloud.langfuse.com`, projeto do Chef
  Caseiro, autenticado.
- **Supabase** — dashboard do projeto (Settings → API é onde ficam as
  chaves, caso precise reconferir; não precisa abrir tabelas com dado real
  em tela cheia durante a Aula 5, ver `docs/aula5-roteiro.md`).
- **Telegram Web**, no grupo da casa (onde `/eusou_chef`/`/eusou_musa` já
  foram usados) — é onde a Aula 4 manda as fotos/links ao vivo.
- **https://chef.workshopee.com.br** — produção, autenticada com Basic
  Auth (usuário/senha do passo 2).
- **GitHub**, no repositório, na aba de Pull Requests — pra mostrar #4 e #6
  abertos se o roteiro pedir.

## 5. Pre-flights do runbook da Aula 4 (≈5 min)

Confirmar que produção está no estado esperado **antes** de gravar
qualquer coisa (se isso já mudou, pare e releia
`docs/RUNBOOK-gravacao-29-08.md` §1 antes de seguir):

⚠️ **Correção importante do runbook.** O `RUNBOOK-gravacao-29-08.md` §1
manda conferir que `origin/master` é **`b876e2c`**. Isso **já não vale
mais** — o merge do PR #7 (docs da gravação) e os documentos criados em
28/08 avançaram o topo de `master`. Seguir o runbook ao pé da letra aqui
produziria um **falso alarme** justamente na hora de gravar.

O que realmente importa não é o hash do topo, e sim que **nenhum código do
app mudou** desde `b876e2c` — só documentação e material de aula. Confira
assim:

```bash
git fetch origin && git diff --stat b876e2c origin/master -- ":(exclude)docs" ":(exclude)slides" ":(exclude)evals" ":(exclude)CLAUDE.md"
```

Resultado esperado: **saída vazia**. Vazio significa que produção continua
com as falhas preservadas exatamente como a Aula 4 precisa. Se aparecer
qualquer arquivo (`server.js`, `telegram.js`, `agent.js`…), aí sim pare e
releia o runbook antes de seguir.

Confirmar que o webhook do Telegram está entregando sem erro (adapte com o
token real, disponível nas variáveis do Railway):

```bash
curl.exe "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

Esperado: `pending_update_count: 0` e `last_error_message` ausente.

## 6. Checklist final antes do REC (≈3 min)

- [ ] `curl.exe` em produção devolveu **401** (não 404)
- [ ] `npm install` rodou sem erro
- [ ] `railway link` apontando pro projeto/serviço certo
- [ ] Senha do Basic Auth em mãos
- [ ] `git diff` do passo 5 saiu **vazio** (nenhum código mudou desde
      `b876e2c`) — **não** confira pelo hash do topo, ele mudou de propósito
- [ ] `getWebhookInfo` sem erro pendente
- [ ] Se for gravar a Aula 3 com o antes/depois:
      `powershell -File scripts/observabilidade.ps1 preparar` já rodado e
      `... status` dizendo **LIGADA**
- [ ] Langfuse, Supabase, Telegram Web, produção e GitHub abertos e
      autenticados
- [ ] `docs/PLANO-GRAVACAO-CURSO.md` aberto **fora do working tree** (ver
      aviso abaixo)

---

## ⚠️ Aviso — os docs desaparecem durante a Aula 4

Durante a Aula 4 você faz `git checkout aula4/fix-diagnostico-telegram` e
depois `git checkout aula4/nota-por-foto`. Essas branches **não têm** os
documentos novos criados nesta sessão (`PLANO-GRAVACAO-CURSO.md`, os
roteiros por aula, o checklist, este próprio arquivo) — eles existem só na
branch de continuidade da documentação. Ou seja: **no meio da Aula 4, o
mapa que você está seguindo some do working tree.**

Duas formas de não ficar sem o guia no meio da gravação — escolha uma
**antes** de começar:

1. **Abrir o `PLANO-GRAVACAO-CURSO.md` (e os roteiros) direto no GitHub
   web**, numa aba separada, na branch onde eles foram commitados — assim
   o conteúdo continua visível independente de qual branch está com
   checkout no terminal.
2. **Manter um segundo clone do repo**, numa pasta separada, parado na
   branch da documentação — nunca faça checkout nele, é só leitura.

Não dependa de reabrir o arquivo pelo editor de código durante a troca de
branch — é exatamente o momento em que ele vai estar ausente do disco.
