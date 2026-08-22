# Aula 4 — roteiro: diagnosticar uma falha real de produção

Episódio real capturado em 2026-08-21, preservado de propósito. **Produção
está com o bug**; o conserto está nesta branch (`aula4/fix-diagnostico-telegram`),
pronto pra ser aplicado ao vivo depois do diagnóstico.

## O que aconteceu (a versão do usuário)

O instrutor mandou uma nota fiscal "bem difícil" pelo Telegram. **Não
aconteceu nada.** Nenhuma reação na mensagem, nenhuma resposta do bot,
nenhum item no estoque. Do lado de quem usa: o produto simplesmente ignorou.

## O que os logs mostram (a versão do sistema)

```
2026-08-22T01:30:11.106373641Z | Erro capturando relato/desejo/aquisicao via Telegram: fetch failed
2026-08-22T01:30:11.106381240Z | Erro processando update do Telegram: fetch failed
```

Duas linhas, e é tudo. Perguntas que o log **não** responde — e que é
justamente o exercício:

1. `fetch failed` de quê? Anthropic? Telegram? SEFAZ? Supabase?
2. Por que caiu no caminho de "relato/desejo/aquisicao" se era uma nota
   fiscal? (pista: o link não foi reconhecido como NFC-e, então a mensagem
   foi tratada como conversa comum)
3. Por que **duas** mensagens de erro?

## A pista escondida no timestamp

As duas linhas têm **8 microssegundos** de diferença
(`...106373641` e `...106381240`). Nenhuma chamada de rede real acontece
nesse tempo. Logo, a segunda falha não é uma nova tentativa de rede: é o
próprio **aviso de erro ao usuário falhando**, dentro do `catch` do
primeiro erro — e, ao estourar, ele engoliu o erro original e disparou o
`catch` de fora.

Esse é o ponto pedagógico central: **o tratamento de erro apagou a
evidência do erro**. Um `catch` que tenta avisar alguém e não protege esse
aviso transforma uma falha diagnosticável em duas falhas genéricas.

## O segundo episódio (2026-08-22): a falha *perfeitamente* silenciosa

No dia seguinte a mesma nota foi reencaminhada. Resultado:

| Onde olhar | O que tem |
|---|---|
| Resposta no Telegram | nada |
| Log do Railway | **nenhuma linha** |
| Trace no Langfuse | **nenhum trace** |
| Banco (pensamentos/estoque) | **nada** |
| `getWebhookInfo` do Telegram | `pending_update_count: 0`, `last_error: nenhum` |

O Telegram **entregou** o update com sucesso (0 pendentes, nenhum erro), e
mesmo assim o sistema não deixou rastro nenhum. Esse é o caso mais rico de
observabilidade do produto inteiro, porque força a pergunta certa:

> Se o canal confirma a entrega e o sistema não registra nada, onde está a
> mensagem?

**Diagnóstico por eliminação**: existe exatamente um caminho no
`processarUpdate` que produz zero log, zero trace, zero escrita e zero
resposta — o `return` mudo para mensagens sem `.text`:

```js
if (!message || !message.text) return; // foto/audio: fora do escopo desta fase
```

Ou seja: a nota "difícil" é uma **foto/PDF do cupom**, não um link. O
produto não sabe ler imagem ainda (é a próxima camada, já registrada no
CLAUDE.md) — mas o pecado não é não saber ler: é **não dizer que não sabe**.

Vale contrastar com o episódio anterior: lá o tratamento de erro destruiu a
evidência; aqui nunca houve evidência para destruir. São os dois modos de
cegueira, e a correção dos dois é a mesma família: nenhum caminho pode
terminar em silêncio.

## Roteiro sugerido (≈15 min)

1. **Reproduzir ao vivo** — mandar a mesma nota difícil no grupo. Nada
   acontece. (Se quiser reproduzir o caso da foto: mandar uma foto do
   cupom — o bot ignora sem dizer nada, porque o handler tem um `return`
   mudo para formatos não-texto.)
2. **Olhar o Langfuse** — mostrar que *não existe trace nenhum* dessa
   interação, ou que ele começa e morre. Ausência de trace também é
   informação: o erro foi antes/durante a chamada ao modelo.
3. **Olhar os logs do Railway** — as duas linhas acima. Discutir por que
   `fetch failed` é uma mensagem inútil: o Node esconde a causa real
   (DNS, TLS, conexão recusada) dentro de `err.cause`, que ninguém logou.
4. **Diagnóstico** — o timestamp de 8µs entrega o mecanismo. Perguntar pra
   turma: "quantos erros aconteceram aqui de verdade?"
5. **Aplicar o fix** (esta branch) e mostrar a diferença.

## O que o fix faz

Três mudanças, todas sobre **não perder informação**:

- `detalharErro()` — desembrulha `err.cause`, então `fetch failed` vira
  `fetch failed (causa: ENOTFOUND)` e diz de que host se trata.
- `avisar()` — avisar o usuário nunca pode derrubar o fluxo. O envio da
  mensagem de erro vira `try/catch` próprio, então o erro *original*
  sobrevive no log em vez de ser substituído pelo erro do aviso.
- Duas falhas silenciosas passam a falar:
  - **link não reconhecido**: se a mensagem tem URL mas não é NFC-e válida,
    o bot diz isso, em vez de mandar o link pro classificador de conversa e
    registrá-lo como um "desejo" sem sentido.
  - **formato não suportado** (foto, áudio, documento): o `return` mudo vira
    uma resposta honesta — "ainda não sei ler foto de cupom, me manda o
    link do QR ou o texto".
- `enviarMensagem()` passa a checar a resposta da API do Telegram, que
  devolve `200` com `{ok:false}` em vários erros — antes, uma mensagem que
  nunca chegou parecia enviada.

## Como aplicar ao vivo

```bash
git checkout aula4/fix-diagnostico-telegram
railway up --service chef-caseiro --detach
```

Depois de subir, mandar a mesma foto/link de novo: agora o bot responde
dizendo exatamente o que não conseguiu fazer.

## Conexão com a convenção do projeto

Este episódio é o terceiro caso da regra registrada no `CLAUDE.md`:
**perguntar antes de "corrigir"** quando um bug pode valer mais como
conteúdo do que como conserto. O fix existia pronto no mesmo dia e foi
deliberadamente segurado fora de produção para a aula.
