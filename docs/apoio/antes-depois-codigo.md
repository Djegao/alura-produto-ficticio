# Antes e depois — o código que mudou

Capturado em **09/09/2026**, imediatamente antes de mergear os PRs #4 e #6.
Este documento existe porque, no formato linear de gravação, o produto vai
para o ar já corrigido — então o "antes" precisa estar preservado em algum
lugar para virar slide.

Os PRs continuam no GitHub como registro completo:
[#4](https://github.com/Djegao/alura-produto-ficticio/pull/4) ·
[#6](https://github.com/Djegao/alura-produto-ficticio/pull/6)

---

## O caso central: a falha silenciosa do canal

### ANTES — `telegram.js` em `master` (até 09/09)

```js
const message = update.message;
if (!message || !message.text) return; // foto/audio: fora do escopo desta fase
```

**Uma linha.** Se a mensagem não tem texto — foto, áudio, documento — a
função retorna. Sem log, sem trace, sem resposta, sem reação.

O comentário é a parte mais reveladora: **estava documentado**. Quem
escreveu sabia. E mesmo assim, quando a falha aconteceu de verdade, do outro
lado da tela, levou tempo até alguém entender o que estava havendo — porque
não havia nada para entender. Só ausência.

### DEPOIS — PR #4

```js
const message = update.message;

// Foto/audio ainda nao sao lidos — mas ANTES isso era um `return` mudo, e
// quem mandava a foto do cupom nao recebia sinal nenhum de que o bot tinha
// desistido (nem reacao, nem mensagem, nem log). Falhar em silencio e' o
// unico pecado capital deste projeto; agora diz que nao sabe ler ainda.
if (message && !message.text) {
  const tipo = message.photo ? 'foto'
    : message.voice || message.audio ? 'audio'
    : message.document ? 'documento' : 'esse formato';

  console.warn('Update ignorado — formato nao suportado:', tipo, '| chat:', message.chat?.id);

  if (message.chat?.id) {
    await avisar(
      message.chat.id,
      tipo === 'foto'
        ? '📷 Ainda não sei ler foto de cupom — leitura por imagem é a próxima camada. Por enquanto me manda o link do QR code da nota, ou o texto dela.'
        : `Ainda não sei processar ${tipo}. Por texto eu entendo tudo: relato, compra, desperdício, porcionamento e link de nota fiscal.`
    );
  }
  return;
}
```

### A leitura para o slide

A capacidade técnica é **exatamente a mesma** nos dois trechos. O produto
continua sem saber ler foto de cupom.

O que mudou:

| | Antes | Depois |
|---|---|---|
| O usuário sabe o que houve? | não | sim |
| Deixa rastro no log? | não | sim (`console.warn`) |
| Sabe o que fazer em seguida? | não | sim (o texto sugere o caminho) |
| É mensurável? | impossível | contável |

**Admitir a limitação já é uma correção.** E há um ganho operacional junto:
o que era invisível virou dado.

---

## As outras duas mudanças do PR #4

**1. O erro passa a ser desembrulhado.** Antes, `fetch failed` — e nada
mais. O Node esconde a causa real (DNS, TLS, conexão recusada) dentro de
`err.cause`, e ninguém logava isso. Agora vira `fetch failed (causa:
ENOTFOUND)`, dizendo de que host se trata.

**2. Avisar o usuário nunca mais derruba o fluxo.** O envio da mensagem de
erro ganhou tratamento próprio. Antes, quando o aviso falhava dentro do
`catch`, ele **substituía** o erro original — que se perdia para sempre.

Essa é a correção direta do episódio dos **8 microssegundos**: dois erros no
log com essa diferença de tempo, impossível para duas chamadas de rede
distintas. A segunda não era uma falha nova — era o aviso da primeira
falhando e engolindo a evidência.

---

## PR #6 — a capacidade nova

Nota fiscal por foto: lê o QR code da imagem e busca o dado oficial na
SEFAZ, com o modelo de visão como degrau de recuo.

**A história que vale mais que a feature:** o desenho original era usar
visão para ler os 44 dígitos da chave impressos no cupom. Óbvio, direto — e
**derrubado por teste**. A SEFAZ exige um código de segurança que só existe
dentro do QR code; não está impresso em lugar nenhum. Nenhum modelo de visão
consegue ler o que não está escrito.

Decisões completas em [`../nota-por-foto-decisoes.md`](../nota-por-foto-decisoes.md).
