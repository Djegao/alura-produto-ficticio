# RUNBOOK — gravação de 29/08

Documento de dia de gravação. Escrito em 23/08 para ser aberto direto da
máquina da escola, sem depender de memória nem da conversa anterior.

**Se você acabou de conectar o Claude numa máquina nova, cole isto como
primeira mensagem:**

> Vou gravar a continuidade da Aula 4. Leia `docs/RUNBOOK-gravacao-29-08.md`
> e me diga o estado atual de produção e das branches antes de qualquer
> coisa.

---

## 1. Estado em 23/08 (confira antes de gravar)

| O quê | Onde está |
|---|---|
| Produção | `master` (`b876e2c`), com **as duas falhas do Telegram preservadas** |
| URL | https://chef.workshopee.com.br (Basic Auth) |
| PR #4 | Correção do diagnóstico do Telegram — **aberto de propósito** |
| PR #6 | Nota fiscal por foto — **aberto, depende do #4** |
| Banco | migrações fases 2–6 rodadas; nada pendente |

**Ordem de deploy no dia: #4 primeiro, #6 depois.** O #6 usa o `avisar()`
que o #4 introduz, e a foto funcionando elimina a falha que o #4 diagnostica.

Para conferir que produção ainda está "quebrada" como esperado:

```bash
git fetch origin && git log --oneline -1 origin/master
```

Se o resultado for `b876e2c`, está tudo como planejado.

---

## 2. O material: quatro falhas reais

Três de canal, uma de estado. Detalhes e evidência em
`docs/aula4-inventario-conteudo.md`.

**Episódio A (21/08) — o tratamento de erro apagou a evidência.**
Dois `fetch failed` no log com **8 microssegundos** de diferença. Nenhuma
chamada de rede acontece nesse tempo: a segunda não é uma nova falha, é o
próprio aviso de erro falhando dentro do `catch` e engolindo o erro
original.

**Episódio B (22/08) — a falha perfeitamente silenciosa.**
Foto do cupom enviada, e: nenhum log, nenhum trace, nenhuma escrita, nenhuma
resposta. E `getWebhookInfo` do Telegram confirma entrega (0 pendentes, sem
erros). Por eliminação, o `return` mudo para mensagem sem `.text`.

**Episódio C (22/08, ao vivo na aula) — o modelo acertou, o código errou.**
Relato *"Comemos 3 porções de lasagna, 1 e 1/2 para cada!"*. O agente
classificou tudo certo (`caseira`, `item_nome: lasagna`, `quantidade: 3`,
somando 1,5 × 2). **E o estoque continuou 5/5** — o prato está gravado como
`lasanha` e o match é `ilike '%lasagna%'`: `gn` × `nh` não casa, e não é
acento. Tudo "funcionou": relato gravado, `meal_report` gravado, reação 👍
enviada, estado errado. **Preservado de propósito** — é o argumento mais
forte do curso para observabilidade de produto, não só de modelo. Só
detectável cruzando o trace com o estado resultante.

**A quebra de expectativa (22/08)** — o instrutor esperava fotografar a nota
e o sistema resolver; a aplicação exigia link ou texto. Virou o PR #6.

---

## 3. Números para o eixo de custo

Dados reais de produção (68 traces, 27/07 → 22/08, US$ 1,65 acumulado):

| Operação | n | Custo médio | Latência média | % do custo |
|---|---|---|---|---|
| `mediar-cardapio` | 10 | US$ 0,1121 | 45,4 s | **68 %** |
| `sugerir-receita` | 13 | US$ 0,0227 | 23,3 s | 18 % |
| `ingerir-relato` | 30 | US$ 0,0051 | 2,6 s | 9 % |

O Mediador é **15 % das chamadas e 68 % da conta**.

E o mesmo agente de ingestão já rodou nos dois modelos, mesma tarefa e mesmo
prompt: **haiku 1,9× mais barato e 2,5× mais rápido** que sonnet
(US$ 0,00293 / 1,17 s contra US$ 0,00563 / 2,99 s).

Com o PR #6 entram **três eixos** trocáveis ao vivo: `model` (geração),
`modelIngestao` (classificação barata) e `modelVisao` (leitura de imagem).

⚠️ **Avise a turma do lag do Langfuse**: ~45 s entre a chamada e o trace
ficar consultável. Sem esse aviso alguém vai achar que o trace sumiu.

---

## 4. Sequência sugerida da gravação

**Ato 1 — a falha.** Mande a foto do cupom no grupo do Telegram. Nada
acontece. Mostre o Langfuse (nenhum trace), os logs do Railway (nenhuma
linha) e o `getWebhookInfo` (entrega confirmada). A pergunta: *se o canal
confirma a entrega e o sistema não registra nada, onde está a mensagem?*

**Ato 2 — o diagnóstico.** Por eliminação, o `return` mudo. Aproveite o
episódio A junto: os 8 µs entregam o mecanismo do erro que se apaga.

**Ato 3 — o remendo honesto.** Aplique o PR #4:

```bash
git checkout aula4/fix-diagnostico-telegram && railway up --service chef-caseiro --detach
```

Mande a foto de novo: agora o bot diz *"ainda não sei ler foto de cupom"*.
Ponto pedagógico: **admitir a limitação já é uma correção** — o bug não era
não saber ler, era não dizer.

**Ato 4 — a capacidade nova.** "Então vamos fazer ele ler." Aplique o PR #6:

```bash
git checkout aula4/nota-por-foto && railway up --service chef-caseiro --detach
```

Mande a foto pela terceira vez: os itens entram no estoque, via dado oficial
da SEFAZ. Aqui cabe contar que o desenho original (visão lê os 44 dígitos)
**foi derrubado por teste** — a SEFAZ-SP exige o hash que só existe dentro
do QR. Evidência em `docs/nota-por-foto-decisoes.md`.

**Ato 5 — a consequência.** Com foto, a taxa de erro sobe, e aí a tela de
revisão deixa de ser luxo. É o gancho para o próximo PR de gaveta (§6).

---

## 5. Comandos de apoio

Acesso na máquina nova:

```bash
railway login && railway link
```

(projeto `chef-caseiro` → `production` → serviço `chef-caseiro`)

Ver as variáveis, inclusive a senha do app:

```bash
railway variable list
```

Rodar local com as variáveis de produção, sem criar `.env`:

```bash
npm install && railway run npm start
```

Logs de produção:

```bash
railway logs --deployment
```

Voltar produção ao estado "quebrado" (se precisar regravar um ato):

```bash
git checkout master && railway up --service chef-caseiro --detach
```

---

## 6. Depois da gravação

- **Tela de revisão de nota** — combinada para ser construída **junto**,
  depois do PR #6 testado, e ficar de gaveta para virar aula. `receipt_items.confirmed`
  já existe no schema e hoje é gravado sempre como `true`.
- **Atualização em tempo real do painel** — decisão explícita de não
  construir: vira exercício de observabilidade (polling × SSE).
- **Match aproximado de nomes** (episódio C) — não corrigir sem decidir; a
  saída provável não é um algoritmo mais esperto, e sim o sistema
  **perguntar** quando estiver em dúvida, como já faz no porcionamento.

---

## 7. Convenção que vale sempre

Ao encontrar um bug que possa virar conteúdo, **perguntar antes de
corrigir**. Já são quatro precedentes. O `CLAUDE.md` lista todos.
