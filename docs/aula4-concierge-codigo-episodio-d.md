# Concierge — código real do Episódio D (episódio 4 do ciclo completo)

> Escrito em 17/09. Formato **capítulo + sugestão de slide**, pensado pra
> leitura prévia — cada capítulo abre com o que ele entrega e onde ele
> encaixa no ciclo, só depois desce pro Tela·Fala·Ação operacional. Leia
> os títulos de capítulo primeiro pra sentir a fluidez; os prompts e
> comandos estão lá pra quando for gravar, não pra primeira leitura.
>
> **Onde este episódio mora no ciclo:** depois do episódio 3 (SDD —
> `docs/aula4-sdd-pre-manufaturado-episodio-d.md`, debatido em câmera) e
> antes do episódio 5 (evals — `docs/aula4-concierge-evals-episodio-d.md`,
> já escrito e **assume que este episódio termina com exatamente esta
> interface**: `pensamentos.status = 'aguardando_porcoes'`, coluna
> `item_pendente`, `trace_id` preenchido na pendência).
>
> **Diferença de peso em relação ao episódio de evals:** aqui você toca
> produção de verdade — schema do Supabase, deploy no Railway, webhook do
> Telegram, merge no `master`. Cada capítulo abaixo marca explicitamente
> onde isso acontece.

> **Atualização 17/09 (tarde): o código é implementado ANTES da gravação.**
> Decisão do Diego: produto o mais pronto possível pra gravar com fluidez.
> O fix está na branch `aula4/fix-episodio-d-porcionamento` (commit
> `49fb770`). Em câmera, os capítulos 4.4.2–4.4.5 e 4.4.7 viram **leitura do
> que foi feito de verdade** (migração, diff, deploy e PR reais), não
> execução. O que continua ao vivo: 4.4.1 (as decisões) e 4.4.6 (smoke test
> no Telegram). Os prompts abaixo ficam como registro de como o código foi
> pedido. Fala de transparência sugerida: "Esse código eu subi antes de
> gravar. Vou mostrar o diff real e testar ao vivo, contra produção."
>
> **Achado novo em 17/09, ao testar o classificador com as mensagens reais
> do Episódio D (Haiku, 2 rodadas cada):**
> - A **mensagem 3 real** ("Porcionei em 2 unidades de 220g e 2 unidades de
>   160g") **nunca traz `item_quantidade`**: chegar a 4 exige somar, e a
>   regra de ouro proíbe a LLM de fazer conta. O desenho original (resolver
>   quando a resposta traz o número) passaria no smoke test ("em 3
>   unidades") e **continuaria falhando na conversa real**.
> - A **mensagem 2**, hoje, às vezes vem com `item_quantidade: 4`: o modelo
>   somou "dois de cada" sozinho, violando a mesma regra. É não
>   determinístico, e em 14/09 não somou.
> - "4" sozinho vira `desejo`.
>
> **O que o código faz com isso:** com uma pendência aberta, resposta sem
> número **pergunta de novo já ancorada no prato** ("Ainda falta o total de
> porções de hambúrguer de patinho. Me manda só 'porcionei em N'"), e a
> pendência continua viva. A referência ao prato não se perde, mas a soma
> 2+2 **não** foi resolvida. Isso fica como decisão em aberto (porções
> parciais extraídas pela LLM e somadas em código?), e é um bom material de
> aula: o fix passa no teste feliz e o caso real ainda pede uma segunda
> volta.

---

## Mapa dos 7 capítulos (leia isto primeiro)

| Cap. | Nome | O que entrega | Onde toca produção |
|---|---|---|---|
| 4.4.1 | Fechar o desenho | as decisões abertas da SDD viram escolhas finais, por escrito | não |
| 4.4.2 | Migração real | a coluna e os status novos existem no banco de verdade | **sim — Supabase** |
| 4.4.3 | Pedir o código pro Claude — persistência | o diff do fix (perguntar + guardar pendência), revisado em tela | não |
| 4.4.4 | Pedir o código pro Claude — expiração | o job novo que fecha pendência esquecida com aviso, revisado em tela | não |
| 4.4.5 | Aplicar, commitar, subir | o fix inteiro (persistência + expiração) vai pro ar | **sim — Railway (deploy)** |
| 4.4.6 | Smoke test contra produção | prova rápida de que o webhook roda o código novo — dos dois caminhos, resolvido e expirado | **sim — Telegram real** |
| 4.4.7 | PR e merge ao vivo | fecha o episódio com o histórico real do repositório | **sim — GitHub** |

Depois do 4.4.7 você emenda direto no episódio de evals (5), que já tem seu
próprio "antes/depois" — não precisa repetir teste de produção lá, o 4.4.6
aqui já cobre o smoke test; o 5 cobre a prova formal com Score no Langfuse.

> **Mudança de 17/09:** este episódio ganhou um capítulo — a ideia (sua)
> de não deixar uma pendência nunca resolvida ficar muda. Sem aviso
> explícito na expiração, o produto continuaria falhando em silêncio,
> só que um passo depois do bug original. `pensamentos.status` ganha um
> terceiro valor, `expirada` (além de `completo` e `aguardando_porcoes`).

---

## Capítulo 4.4.1 — Fechar o desenho

**Entrega:** as 4 perguntas deixadas abertas em
`docs/aula4-sdd-pre-manufaturado-episodio-d.md` (nome do status, onde
guardar o item pendente, janela de expiração, escopo do fix) saem daqui
como decisão escrita, não mais debate.

**Slide sugerido:** título "Quatro decisões, uma casa" — 4 linhas, uma por
pergunta, com o espaço da resposta em branco até você decidir em câmera
(literalmente construir a resposta na tela, não mostrar já preenchida —
mesmo efeito da 2.5 preenchendo `criterios.md` ao vivo).

**TELA:** o próprio arquivo `docs/aula4-sdd-pre-manufaturado-episodio-d.md`
aberto no editor, seção "Pontos pra debater ao vivo".

**FALA**

Antes de escrever uma linha de código, quatro decisões pequenas que fazem
diferença depois. Vou decidir as quatro agora, em voz alta, e a última
etapa deste episódio é registrar isso na SDD do produto pra sempre.

**AÇÃO — decisões recomendadas (você pode divergir em câmera, é o ponto):**

1. **Nome do status:** `aguardando_porcoes` (simetria com o que já existe).
2. **Onde guardar o item pendente:** coluna nova `item_pendente` (não
   reusar `descricao` — mais explícito pro eval do episódio 5 consultar).
3. **Janela de expiração:** **20 minutos** — apresente como decisão, mas
   **deixe o debate aberto em câmera.**

   > **🔔 LEMBRETE PRA VOCÊ (não é fala literal):** esse debate aconteceu
   > de verdade em 17/09. Você considerou ir **até 120 minutos** — janela
   > longa não custa API (o job não chama LLM) e frustra menos quem demora
   > pra responder. O que segurou foi o risco de **criar problema novo no
   > produto**: com a janela longa, o mesmo ator acumula mais de um prato
   > pendente e o número de porções cai no **prato errado, em silêncio** —
   > o mesmo tipo de falha que este episódio está corrigindo. Não é risco
   > de confundir pessoas (a pendência é filtrada por `actor_id`) nem tipo
   > de mensagem (só `porcionamento` sem nome de prato entra).
   > Primeira versão da decisão foi 10 min; 20 é o meio-termo.

   **FALA sugerida:** "Coloquei 20 minutos. Cheguei a pensar em duas horas
   — não custa nada a mais — mas aí eu abro espaço pra um bug novo: eu
   cozinho dois pratos, não respondo nenhum, e a próxima resposta vai pro
   prato errado sem ninguém perceber. Essa régua não está fechada; é uma
   aposta que o dado de uso vai confirmar ou derrubar."
4. **Escopo:** só porcionamento hoje — generalizar pra qualquer guardrail
   (P2 do backlog) fica pra quando houver um segundo caso real.

**AÇÃO:** edite o bloco final da SDD pré-manufaturada, resolvendo as 4
perguntas em texto corrido (não precisa reescrever tudo — só fechar as
lacunas). Isso já é a versão quase-final do que vai pro `SDD.md` no
capítulo 4.4.6.

---

## Capítulo 4.4.2 — Migração real

**Entrega:** o banco de produção passa a aceitar o status e a coluna
novos. **Sem isso, nada dos próximos capítulos funciona.**

**Slide sugerido:** título "Uma coluna, uma restrição" — mostra literalmente
o SQL como conteúdo do slide (2 linhas de `alter table`), no mesmo espírito
didático de mostrar schema real que a Aula 3 já usa.

**TELA:** SQL Editor do Supabase (produção — mesmo projeto do `.env`).

**FALA**

Isso aqui é a única parte deste episódio que eu não vou pedir pro Claude
escrever — é schema, é barato, é dois comandos, e é convenção deste
projeto rodar migração manual no SQL Editor, documentada depois no
`schema.sql`.

**AÇÃO — cole e execute:**

```sql
alter table pensamentos
  add column if not exists item_pendente text;

alter table pensamentos drop constraint if exists pensamentos_status_check;
alter table pensamentos add constraint pensamentos_status_check
  check (status in ('completo', 'aguardando_categoria', 'aguardando_porcoes', 'expirada'));
```

**FALA (linha extra, justificando o terceiro valor já na migração)**

Reparem que já entra um terceiro status, `expirada` — não é só "pendente
ou resolvida". Uma pendência que nunca resolve precisa de um destino
final que alguém vê, não só desaparecer da lista de pendências.

**AÇÃO:** confirme rodando a consulta de aquecimento do episódio de evals
(`docs/aula4-concierge-evals-episodio-d.md`, Setup item 1) — se não der
erro, a migração pegou.

---

## Capítulo 4.4.3 — Pedir o código pro Claude (persistência)

**Entrega:** o diff do fix, ainda não aplicado — só revisado em tela.

**Slide sugerido:** título "O padrão já existe, só falta usar" — bullets:
`aguardando_categoria` (já existe) → `aguardando_porcoes` (novo, mesmo
molde). Reaproveita a ideia visual "achar o padrão que já existe" da
2.5.6.

**TELA:** chat do Claude, depois editor em `intencao-efeitos.js`.

**FALA (antes de colar)**

O fluxo de orçamento já resolve exatamente este problema pra outro caso —
pergunta, guarda a pendência, a resposta seguinte resolve. Vou pedir pro
Claude aplicar a mesma forma pro porcionamento, sendo bem explícito sobre
as quatro decisões que acabei de fechar.

**AÇÃO — cole exatamente este prompt:**

```
Em intencao-efeitos.js, ramo `porcionamento` (função aplicarIntencao):

Hoje, quando falta item_quantidade mas item_nome é conhecido, o codigo so'
seta `pergunta` e retorna sem persistir nada (o insert do fim so' acontece
`if (!pergunta)`). Quero o mesmo padrao que o fluxo de orcamento ja usa
(status aguardando_categoria, telegram.js:71-79) aplicado aqui:

1. Quando item_nome existe e item_quantidade falta: alem de perguntar,
   inserir um pensamento com status='aguardando_porcoes',
   tipo='porcionamento', item_pendente=item_nome, trace_id=traceId
   (o parametro que a funcao ja recebe).
2. Quando item_nome FALTA mas item_quantidade existe (a mensagem pode ser
   resposta a uma pendencia anterior): antes de cair no "else" generico,
   buscar no Supabase o pensamento mais recente com
   status='aguardando_porcoes' para este actor.id, dentro de uma janela de
   20 minutos (created_at). Se achar, usar o item_pendente dele como
   item_nome e seguir o fluxo normal de porcionar (baixa estoque, grava
   pensamento completo) — e marcar aquele pensamento pendente como
   'completo' no final.
3. Se nao achar pendencia nenhuma dentro da janela, mantem o comportamento
   atual (pergunta generica "Porcionou o que, e em quantas porcoes?").

Regra do projeto: matematica/estado sempre em codigo, sem chute; nada
falha em silencio (erro de consulta ao Supabase propaga, nao vira
`|| null`).
```

**AÇÃO:** leia o diff proposto. Confira contra as 4 decisões do capítulo
4.4.1 (nome do status, coluna, janela, escopo) — se o Claude inventar um
nome diferente ou reusar `descricao`, corrija pedindo de novo, não aceite
por economia de tempo.

**FALA (enquanto lê)**

Repara que a mudança inteira mora dentro de uma função que já existia —
não precisou de arquitetura nova, só um pedaço de estado que faltava.

---

## Capítulo 4.4.4 — Pedir o código pro Claude (expiração)

**Entrega:** um job novo que fecha o buraco que a persistência sozinha
deixaria aberto — uma pendência que ninguém nunca respondeu, hoje, ficaria
`aguardando_porcoes` pra sempre, sem ninguém saber.

**Slide sugerido:** título "Persistir não basta — precisa de um fim" —
2 colunas: "resolvida" (✓ já cobre) / "esquecida" (✗ ainda muda, sem este
capítulo).

**TELA:** chat do Claude, depois editor — arquivo novo (sugestão:
`expiracao-porcionamento.js`, ao lado de `lembrete.js`, mesmo padrão de
job dedicado por responsabilidade que o projeto já usa).

**FALA (antes de colar)**

O produto já tem um job que pergunta pro dono quando falta relato —
`lembrete.js`, hora em hora. A pendência de porcionamento precisa da mesma
ideia, só que rápida: minutos, não horas, porque a conversa real se resolve
ou morre em minutos, não num dia.

**AÇÃO — cole exatamente este prompt:**

```
Crie expiracao-porcionamento.js, no MESMO padrao estrutural de lembrete.js
(setInterval, dedupe em memoria, avisar via enviarMensagem/avisar do
telegram.js) — mas checando a cada 2 minutos, nao a cada hora, e sem
depender de HORA_LEMBRETE (essa janela nao tem hora do dia, e' relativa ao
created_at da pendencia).

Logica: busca em `pensamentos` toda linha com status='aguardando_porcoes'
e created_at mais antigo que 20 minutos atras. Para cada uma: atualiza
status='expirada', e manda via avisar() a mensagem exata "Ingestao nao
concluida por falta de porcoes: {item_pendente}." pro telegram_chat_id do
household.

Regra do projeto: nada em silencio — erro de consulta ao Supabase loga com
detalharErro, nao vira `|| []`. Exporte uma funcao pra iniciar o
setInterval (mesmo nome de padrao de lembrete.js: iniciarExpiracaoPorcionamento),
e registre a chamada dela em server.js, ao lado de onde iniciarLembretes()
ja e' chamado.
```

**AÇÃO:** leia o diff. Confirme que a mensagem final bate exatamente com a
frase que você propôs ("Ingestão não concluída por falta de [ ]") — é
proposital ser literal, não paráfrase, porque essa frase vira o padrão de
UX pra qualquer guardrail futuro que expirar.

**FALA (fechando o capítulo)**

Isso fecha o §8 do produto de um jeito que a v1 do meu desenho não fechava
— antes eu só fazia a pendência existir; agora ela sempre termina em algo
que alguém vê.

---

## Capítulo 4.4.5 — Aplicar, commitar, subir

**Entrega:** o fix está rodando em produção.

**Slide sugerido:** nenhum slide novo — fica na tela do terminal (mesmo
tratamento que a 2.5 deu ao "PR simulado", só que aqui é deploy real, não
simulado).

**TELA:** editor (aplicar o diff) → terminal PowerShell.

**AÇÃO:**
```powershell
git checkout -b aula4/fix-episodio-d-porcionamento
git add intencao-efeitos.js expiracao-porcionamento.js server.js
git commit -m "Persiste e expira pendencia de porcionamento (Episodio D) para o ciclo pergunta-resposta se resolver ou avisar"
git push -u origin aula4/fix-episodio-d-porcionamento
railway up --service chef-caseiro --detach
```

**FALA**

Aqui é onde este episódio se separa da 2.5: lá o PR era simulado. Aqui eu
vou dar o push, mandar pro Railway, e esse código passa a valer pra minha
casa de verdade a partir de agora.

**AÇÃO:** confirme o deploy (Railway costuma levar ~1 min):
```powershell
curl.exe -s -o NUL -w "producao: HTTP %{http_code}\n" https://chef.workshopee.com.br
```

---

## Capítulo 4.4.6 — Smoke test contra produção

**Entrega:** prova rápida, em tela, de que o webhook já está rodando o
código novo — os **dois caminhos**, não só o feliz. Sem isso, o
"antes/depois" do episódio 5 (evals) não tem terreno firme.

**Slide sugerido:** nenhum — é tela de Telegram, ao vivo.

**TELA:** app do Telegram, grupo real da casa.

**AÇÃO 1 — caminho resolvido:** mande uma mensagem de porcionamento
**incompleta** (ex.: "Preparei frango desfiado, 300g") e confirme que o
bot pergunta quantas porções. Responda só o número, sem repetir o nome do
prato ("Porcionei em 3 unidades"). Confirme que a resposta do bot
**menciona o prato certo** (frango desfiado), não uma pergunta genérica
nova.

**AÇÃO 2 — caminho expirado (novo, por causa do capítulo 4.4.4):** mande
uma segunda mensagem de porcionamento incompleta com **outro prato** (ex.:
"Preparei sopa de abóbora") e **não responda a pergunta**. Espere ~20-22
min (janela de 20 + até 2 min do ciclo do job) (ajuste o roteiro pra deixar isso rodando enquanto grava outra coisa —
não precisa ficar parado esperando em cena) e confirme que chega
espontaneamente a mensagem "Ingestão não concluída por falta de porções:
sopa de abóbora." — sem você ter feito nada.

**FALA**

Isso aqui não é o teste formal — o teste formal com Score é o próximo
episódio. Isso é só "o código que a gente acabou de subir está mesmo no
ar, e faz as duas coisas que eu acabei de descrever: resolve quando
resolve, e avisa quando não resolve".

**[SE o bot não reconhecer a continuação, ou não mandar o aviso de
expiração]** — pare aqui, não avance pro episódio 5 fingindo que
funcionou. Volte pro capítulo 4.4.3 ou 4.4.4 (o que falhou), revise o diff
contra o prompt, e repita 4.4.5.

---

## Capítulo 4.4.7 — PR e merge ao vivo

**Entrega:** fecha o episódio com histórico real — a SDD final entra junto,
no mesmo PR.

**Slide sugerido:** título "Fechado, não só narrado" — tela do PR real
(título, corpo, diff), contraste direto com o slide "Isso aqui é simulado"
da 2.5.7.

**TELA:** editor (colar a SDD final em `SDD.md`, seção 11.7) → terminal →
GitHub (PR real).

**AÇÃO:**
```powershell
git add SDD.md
git commit -m "SDD 11.7: persistencia e expiracao de pendencia de guardrail (Episodio D)"
git push
gh pr create --base master \
  --title "Fix: pendencia de porcionamento persistida (Episodio D)" \
  --body "Corrige o ciclo pergunta-resposta que nunca se resolvia no porcionamento (docs/aula4-investigacao-sdd.md, Episodio D). Adiciona SDD 11.7."
gh pr merge --merge
```

**FALA**

Título, corpo, diff, merge — o mesmo destino de qualquer mudança de
produto de verdade. A diferença desta aula pras anteriores é essa palavra:
"merge", não "simulado".

**[decisão sua em câmera, deixada aberta de propósito]:** squash, merge
comum ou rebase — qualquer um serve pra história; escolha o que você já
usa nas outras branches deste projeto.

---

## Depois deste episódio

Você está pronto pro episódio 5 (evals,
`docs/aula4-concierge-evals-episodio-d.md`) com a interface exata que ele
espera: `pensamentos.status` valendo `completo`, `aguardando_porcoes` ou
`expirada`, com `item_pendente` e `trace_id` preenchidos. O "depois" você
já validou aqui, nos dois caminhos, no smoke test (4.4.6) — resolvido e
expirado. No episódio 5 você repete a mesma prova formalmente, com o eval
lendo o `status` direto (sem recalcular janela nenhuma) e um Score real
saindo no Langfuse.

**Atenção pro episódio 5:** o "antes" que eu tinha planejado (o trace
histórico de 14/09, `240ad5bb32...`) **não vai funcionar automaticamente**
com este desenho — o bug original nunca persistiu pendência nenhuma, então
não existe linha em `pensamentos` com aquele `trace_id` pra ler. Ver a nota
de backfill no início do episódio 5.
