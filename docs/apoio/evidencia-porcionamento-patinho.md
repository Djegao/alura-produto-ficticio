# Evidência preservada — o hambúrguer que sumiu (14/09/2026)

Extraído do Langfuse em **14/09/2026** via API pública, na mesma sessão em
que aconteceu. Os 4 JSONs completos estão em
[`traces-preservados/`](./traces-preservados/) (`porcionamento-patinho-1.json`
a `-4.json`, em ordem cronológica).

> ## Por que este é o achado mais forte do projeto até agora
>
> Os quatro achados anteriores (truncamento, match lasanha/lasagna, e os dois
> episódios do Telegram) são cada um uma falha **dentro de uma interação**.
> Este é diferente: **cada interação, isolada, está perfeita**. O modelo
> classificou certo quatro vezes seguidas, sem um único erro. A falha só
> existe na **sequência** — e ela derruba justamente o guardrail que o
> projeto até então citava como exemplo de boa prática: "porcionar sem
> número dito vira pergunta, nunca chute."

---

## A conversa real, no Telegram (18:17–18:18, horário local)

> **[18:17] Diego:** O que vamos comer na sexta?
> **🤔** *(reação, sem texto)*
>
> **[18:18] Diego:** Preparei hambúrguer de patinho, 220g pra mim e 160g pra
> esposa. Tá pronto no congelador, dois de cada. Adicionar ao estoque da
> geladeira
>
> **[18:18] bot:** 🤔 Quantas porções rendeu a hambúrguer de patinho? Só
> quem cozinhou sabe — me manda "porcionei hambúrguer de patinho em N".
>
> **[18:18] Diego:** Porcionei em 2 unidades de 220g e 2 unidades de 160g
>
> **[18:18] bot:** 🤔 Porcionou o quê, e em quantas porções?
>
> **[18:18] Diego:** O hambúrguer de patinho
> **🤔** *(reação, sem texto — fim da conversa)*

## Os quatro traces, um por um

**Trace 1** (`1b17effcb5...`, 21:17:39 UTC)

```json
input:  {"texto": "O que vamos comer na sexta?"}
output: {"tipo": "desejo", "descricao": "O que vamos comer na sexta?"}
```

Classificação correta. Efeito no produto: reação 🤔, nada mais — não existe
comando de mediação no Telegram (só um botão no painel web). Pergunta real,
resposta nenhuma.

**Trace 2** (`240ad5bb32...`, 21:18:05 UTC — 26s depois)

```json
input:  {"texto": "Preparei hambúrguer de patinho, 220g pra mim e 160g pra esposa. Tá pronto no congelador, dois de cada. Adicionar ao estoque da geladeira"}
output: {"tipo": "porcionamento", "item_nome": "hambúrguer de patinho",
          "descricao": "Preparou hambúrguer de patinho em duas porções (220g e 160g), dois de cada..."}
```

`item_nome` extraído certo. **`item_quantidade` ausente** — mesmo a
informação estando na frase ("dois de cada" = 2×220g + 2×160g = 4
unidades). Sem quantidade, o guardrail dispara a pergunta — e, por decisão
explícita do código (comentário original: *"quando o sistema precisou
perguntar, nada de estado mudou e o pensamento não é gravado"*), **nada é
persistido**. Esta tentativa não deixa rastro nenhum no feed do produto.

**Trace 3** (`4878012867...`, 21:18:27 UTC — 22s depois)

```json
input:  {"texto": "Porcionei em 2 unidades de 220g e 2 unidades de 160g"}
output: {"tipo": "porcionamento", "descricao": "Porcionei em 2 unidades de 220g e 2 unidades de 160g"}
```

Diego respondeu **no formato exato** que o bot sugeriu — só que, como
qualquer pessoa faria numa resposta direta, sem repetir o nome do item.
**`item_nome` ausente desta vez.** O classificador não tem acesso à
mensagem anterior: começa do zero, não sabe que "hambúrguer de patinho" já
foi dito 22 segundos antes. Pergunta diferente, ainda mais genérica. De
novo, nada persistido.

**Trace 4** (`0e11e60b7e...`, 21:18:40 UTC — 13s depois)

```json
input:  {"texto": "O hambúrguer de patinho"}
output: {"tipo": "desejo", "descricao": "O hambúrguer de patinho"}
```

Diego tenta a terceira vez, agora só o nome do item — sem verbo, sem
contexto explícito. Sem histórico de conversa, o classificador não tem como
saber que isso é resposta a uma pergunta pendente. Reclassifica como
`desejo` (frase nominal solta pareceu um desejo, não uma resposta). A
conversa se encerra sozinha, com um emoji, sem nunca resolver.

## O estado final — verificado no banco, 14/09

```json
// pantry_items, filtro "%patinho%": 1 resultado
{
  "name": "carne moída patinho",
  "quantity": 2, "unit": "kg", "state": "base",
  "source": "nota_fiscal", "created_at": "2026-07-31..."
}
// nenhum item com state="preparado" e name~"hambúrguer de patinho"
```

**O hambúrguer preparado e porcionado de verdade nunca entrou no estoque.**
Quatro mensagens reais, uma ação física de cozinhar — resultado líquido
zero, e **nenhum erro em lugar nenhum**: sem log, sem trace de erro, sem
linha no feed. Só os quatro traces "bem-sucedidos" no Langfuse, cada um
isolado e correto, contam a história.

## Por que isso quebra o framework de diagnóstico prompt/dados/modelo

A pergunta clássica de diagnóstico (Aula 4.2) é: o problema está no prompt,
nos dados, ou no modelo?

- **Prompt de cada chamada:** correto. Pediu exatamente o que devia.
- **Dados de cada mensagem:** corretos. O texto que chegou era claro.
- **Modelo:** acertou a classificação quatro vezes seguidas.

**Nenhuma das três categorias explica a falha.** A causa é uma quarta,
arquitetural: **o sistema em volta do modelo não guarda estado de
conversa.** `ingerirRelato` recebe só o texto da mensagem atual — sem
histórico, sem saber que existe uma pergunta pendente esperando resposta.
O guardrail "pergunte, não chute" pressupõe continuidade que a implementação
não tem.

## Por que os evals da Aula 2 não pegariam isso

O pipeline (`evals/run-evals.js`) julga **um trace por vez**, contra um
critério de qualidade daquela interação isolada. Rodado contra qualquer um
dos quatro traces acima, o veredito seria "aprovado" nos quatro — cada
classificação, isolada, está certa. **O eval não tem como enxergar a
sequência.** Corrigir isso exigiria um critério novo: não "esta resposta
está certa?", mas "este ciclo de pergunta-e-resposta chegou a se resolver?"
— um tipo de avaliação que a Aula 2 ainda não constrói.
