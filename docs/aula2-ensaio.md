# Aula 2 — folha de ensaio

Documento de bancada: o que checar antes, a ordem de execução, o que vai
aparecer na tela e o que dizer se der ruim. A fala completa está na
[leitura única](aula2-leitura-unica.md) e nas notas dos 47 slides.

---

## Pré-flight (verificado em 03/09, 17h)

| Item | Estado | Como confirmar |
|---|---|---|
| Langfuse | ✅ **LIGADA** | `.\scripts\observabilidade.ps1 status` |
| Demo do 2.3 | ✅ roda em **15 s** | comando abaixo |
| Demo do 2.4 | ✅ roda em **1min05** | comando abaixo |
| Deck | ✅ 47 slides, todos com nota | `slides/aula2-alura-live.pptx` |

**Janelas**: 1) deck em apresentação · 2) terminal na raiz do repo, fonte
grande · 3) `evals/criterios.md` no editor.

---

## Ordem de execução

| Bloco | Slides | Ação ao vivo | Tempo da ação |
|---|---|---|---|
| **2.1** | 2–14 | nenhuma | — |
| **2.2** | 15–26 | abrir `criterios.md` no slide "Todo critério tem quatro partes" | — |
| **2.3** | 27–35 | rodar o juiz numa mediação, depois do slide "Prompt não é contrato" | **15 s** |
| **2.4** | 36–46 | rodar o conjunto, depois do slide "O que eu deliberadamente não medi" | **1min05** |
| Fecho | 47 | — | — |

**Builds** (mesma tela, uma linha por vez — leia a nota inteira na primeira
cópia e vá revelando): 3–7 · 9–12 · 18–22 · 39–42.

---

## Demo do 2.3 — o juiz julgando uma mediação

```bash
node evals/run-evals.js --dry-run --limit 1 --operacao mediar-cardapio
```

**15 segundos.** Na tela vão aparecer os 5 critérios do Mediador com nota e
justificativa. **Leia estas duas em voz alta** — são as que mais ensinam:

> `execucao_integra 0.00` — *"a saída final está visivelmente cortada no meio
> da frase 'Ovos brancos' sem concluir a análise; o restante da resposta
> (custos, trade-offs, pergunta final) nunca chega a existir."*

> `numeros_de_tool 1.00` — *"o único número que aparece na saída truncada
> (2,5 kg de macarrão espaguete) corresponde exatamente ao retorno de
> `verificar_disponibilidade`, então não há número inventado no trecho
> existente."*

**O ponto a fazer com essas duas juntas** (vale ouro, e não está no slide):

> "Olha o que aconteceu aqui. O mesmo truncamento tirou zero num critério e
> **um** no outro. E os dois estão certos.
>
> Ele tirou zero em integridade porque a resposta foi cortada. E tirou um em
> 'números vieram de ferramenta' porque o único número que sobrou na parte
> cortada estava correto — ele não inventou nada.
>
> É por isso que critério não é redundante. Se eu tivesse um critério só, eu ia
> ter uma nota que não me diz o que fazer. Com os dois, eu sei exatamente onde
> está o problema: não é invenção, é corte."

---

## Demo do 2.4 — o conjunto inteiro

```bash
node evals/run-evals.js --dry-run --limit 2
```

**1min05.** Resultado real de 03/09 — **média geral 0,56, 21 scores em 5
interações**. Note que as notas estão espalhadas, não tudo zerado:

```
sugerir-receita     execucao_integra 0.50 · fidelidade_ao_estoque 0.20
                    respeito_as_restricoes 0.50 · consumo_registrado 0.50
mediar-cardapio     execucao_integra 0.00 · trade_off_com_numeros 0.00
                    numeros_de_tool 1.00 · mediou_sem_decidir 0.00
                    falta_virou_trade_off 0.00
ingerir-relato      execucao_integra 1.00 · tipo_correto 1.00
                    sem_invencao_numerica 1.00 · ancoragem_no_texto 0.70
```

### 🎯 O momento mais forte da aula está aqui

O `--limit 2` traz **dois traces de `sugerir-receita` com o mesmo pedido,
com dois minutos de diferença** (12/08, 13h53 e 13h55):

| Critério | 13:53 | 13:55 |
|---|---|---|
| `execucao_integra` | **1.00** | **0.00** |
| `respeito_as_restricoes` | **1.00** | 0.00 |
| `consumo_registrado` | **1.00** | 0.00 |
| `fidelidade_ao_estoque` | 0.40 | 0.00 |

**Aponte isso na tela e diga:**

> "Repara nesses dois. Mesmo pedido, palavra por palavra. Dois minutos de
> diferença. Um passou em três critérios de quatro, o outro tirou zero em
> todos.
>
> Lembra do que eu falei no começo da aula? Testar uma vez responde sobre
> aquele momento. Isso aqui não é um slide meu tentando te convencer — é o meu
> produto, no dia doze de agosto, provando isso sozinho.
>
> Se eu tivesse testado às treze e cinquenta e três, eu ia dizer que estava
> funcionando. Dois minutos depois eu estaria errado."

E o `0.40` da que **deu certo** é o segundo ponto:

> `fidelidade_ao_estoque 0.40` — *"a receita cita 'tomate' (200g), 'cebola'
> (150g) e 'azeite extravirgem', que não aparecem na lista de
> `consultar_estoque`."*

> "E olha essa. Essa resposta foi boa — ela respeitou a restrição, registrou o
> consumo, chegou inteira. Se eu tivesse lido à mão, eu teria aprovado.
>
> E o critério pegou uma coisa que eu não ia pegar: ela citou tomate, cebola e
> azeite, e nenhum dos três estava na consulta que ela fez. Ela completou com o
> que 'todo mundo tem em casa'.
>
> Isso é exatamente a falha que eu previ no vídeo passado — e eu só vi porque
> escrevi o critério antes."

---

## Se der ruim (previsto, não improvisado)

### Um trace pode falhar no meio da rodada

Aconteceu no pré-flight:

```
[1/2] 1ecca5e617e2...  FALHOU
  Error: O juiz nao devolveu o criterio "execucao_integra"
```

O `tool_choice` forçado garante que a ferramenta seja **chamada** — não que
todo campo obrigatório venha preenchido. **Se acontecer na gravação, não
corte. Use:**

> "Olha o que acabou de acontecer: o **juiz** falhou. Ele não devolveu um dos
> critérios.
>
> E repara em duas coisas. Primeira: o script não engoliu isso. Ele parou,
> disse qual trace, disse qual critério faltou. Falha silenciosa era o que eu
> pedi pro juiz ser severo — e é o que eu exijo do meu próprio código também.
>
> Segunda: eu falei que forçar a ferramenta é uma garantia estrutural. E é —
> mas ela garante que a ferramenta seja **chamada**, não que todo campo venha
> preenchido. Garantia tem limite, e saber onde fica o limite é parte do
> trabalho."

### Se a rodada vier toda 1.00

Improvável, mas: não é motivo pra comemorar em cena — é o slide "se tudo passa,
o critério está fácil demais" acontecendo. Aumente pra `--limit 3` e rode de
novo.

### Se o Langfuse estiver desligado

O script para com *"Faltam variaveis de ambiente: LANGFUSE_..."*. Rode
`.\scripts\observabilidade.ps1 on` e tente de novo.

---

## Depois do REC

```bash
.\scripts\observabilidade.ps1 off
```

A Aula 3 precisa do Langfuse desligado pro contraste "antes/depois" do 3.2.
