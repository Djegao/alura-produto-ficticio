# Evidência preservada — os dois traces que sustentam as Aulas 3 e 4

Extraído do Langfuse em **09/09/2026** via API pública. Os JSONs completos
estão em [`traces-preservados/`](./traces-preservados/).

> ## ⚠️ Por que este documento existe
>
> O Langfuse Cloud retém ~30 dias. O trace do truncamento é de **12/08** —
> ele sai da janela por volta de **11/09**, ou seja, em dois dias. O do
> episódio C é de 22/08 e sai por volta de 21/09.
>
> **A partir de agora a evidência vive aqui**, não no Langfuse. Estes dados
> são suficientes para montar os slides e sustentar a narrativa mesmo depois
> que os traces sumirem do painel.

---

## Evidência 1 — Truncamento por `max_tokens` (SDD §11.4)

**Trace:** `57debf7a71533fdc6a9e7a982595ba7c`
**Quando:** 12/08/2026, 13:55 UTC
**Operação:** `sugerir-receita` · modelo `claude-sonnet-5` · custo US$ 0,02838
**Nível do trace:** `ERROR`

### A cadeia causal, em quatro elos

**Elo 1 — a saída bate exatamente no teto.**

| | tokens |
|---|---|
| entrada | 7.448 |
| **saída** | **1.024** ← o teto configurado, na mosca |

Saída igual ao teto não é coincidência: é a assinatura de truncamento.

**Elo 2 — onde o corte aconteceu.** A resposta terminou assim:

> "...Queijo mussarela – 100 g
>
> **Vou registrar o uso desses itens agora.**"

E o bloco seguinte era um `tool_use` — a chamada de `registrar_itens_usados`.
O modelo anunciou a ação e foi cortado **no meio de executá-la**.

**Elo 3 — a chamada ficou órfã.** O `tool_use` foi emitido pela metade, sem
o `tool_result` correspondente.

**Elo 4 — a requisição seguinte morre.** Mensagem literal da API:

```
400 invalid_request_error
messages.4: `tool_use` ids were found without `tool_result` blocks
immediately after: toolu_01HgWZ8SeBNMtYN8eDErXszz
```

### Por que isso é bom conteúdo

O truncamento começou **cosmético** — uma frase cortada no fim da resposta.
Virou **crash** quando a despensa cresceu o suficiente para o corte cair
dentro de uma chamada de ferramenta. Mesma configuração, mesmo código: só os
dados mudaram de tamanho.

É o exemplo mais limpo do curso de degradação sem ninguém mexer em nada.

---

## Evidência 2 — Episódio C: o modelo acertou e o código errou

**Trace:** `41a4e5c75e3331cad95e7ffe8ba9932d`
**Quando:** 22/08/2026, 14:38 UTC
**Operação:** `ingerir-relato` · modelo `claude-haiku-4-5` · custo US$ 0,00334
**Nível do trace:** sem erro. Tudo "funcionou".

### O que entrou

```
"Comemos 3 porções de lasagna, 1 e 1/2 para cada!"
```

### O que o modelo devolveu — sem um único erro

```json
{
  "tipo": "relato_refeicao",
  "descricao": "Comeram 3 porções de lasagna ao total, 1 e 1/2 porção para cada pessoa",
  "data": "2026-08-22",
  "fonte_refeicao": "caseira",
  "item_nome": "lasagna",
  "item_quantidade": 3
}
```

Classificação correta. Fonte correta. Item extraído. Quantidade correta —
inclusive resolvendo que "1 e 1/2 para cada" com duas pessoas dá 3.

### O que aconteceu com o estoque

**Nada.** Verificado em 09/09, dezoito dias depois:

```json
{ "name": "lasanha", "portions_total": 5, "portions_remaining": 5 }
```

### A causa

O prato está gravado como **lasanha** (`nh`). O relato veio **lasagna**
(`gn`). A busca por similaridade não casa as duas grafias — não é acento,
não é maiúscula, é grafia mesmo.

### Por que isso é o melhor caso do curso

Tudo o que era observável deu certo: o relato foi gravado, o registro da
refeição foi gravado, o bot reagiu com 👍 na mensagem. Nenhum log de erro,
nenhum trace vermelho, nenhum alerta.

**A única forma de detectar era cruzar o trace com o estado resultante.** É
o argumento mais forte do curso para observabilidade de produto, não só de
modelo — e a razão de ele ter sido preservado de propósito.

---

## Como usar isto nos slides

| Slide | Conteúdo |
|---|---|
| Truncamento — a assinatura | tabela de tokens, com 1.024 = teto destacado |
| Truncamento — onde cortou | a frase "Vou registrar o uso desses itens agora." + o `tool_use` cortado |
| Truncamento — o efeito dominó | os quatro elos, terminando no erro 400 literal |
| Episódio C — entrada e saída | o texto do relato ao lado do JSON perfeito |
| Episódio C — o estado | `5/5` porções, com a data de hoje |
| Episódio C — a causa | `lasanha` × `lasagna`, com `nh` e `gn` destacados |
