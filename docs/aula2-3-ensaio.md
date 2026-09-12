# Ensaio — 2.3 Claude como avaliador

Slides 22 a 30 do deck. Duração alvo: **10 a 12 min**.
Demo no slide 29, em `--dry-run`, terminal. Sem Langfuse na tela.

---

## Demo — validada em 12/09 (4 rodadas)

**Os quatro binarios sao estaveis.** Nas quatro rodadas deram sempre o mesmo:

`execucao_integra` 0 · `numeros_de_tool` 1 · `mediou_sem_decidir` 1 ·
`falta_virou_trade_off` 0

**O `trade_off_com_numeros` oscila entre 0,5 e 0,6.** É o único critério de
escala contínua do conjunto, e o juiz varia na casa decimal. **Não diga o
número antes de ele aparecer.** Fale o sentido, que é estável: *"ficou no meio
termo — tem número concreto, mas a resposta foi cortada antes de fechar o
trade-off"*. Se quiser citar o valor, leia da tela.

Leva ~25 s. O trace é o risoto de camarão de 22/08, e continua no Langfuse.

### A redacao das justificativas muda a cada rodada

O sentido não muda, as palavras sim. **Não decore a frase do juiz e não
prometa palavra exata** — leia o que estiver na tela e parafraseie.

### Dois ajustes feitos hoje no `run-evals.js`

**Cabeçalho do terminal:** dizia "Chef Caseiro", agora diz "Musa Balance".
Aparecia na primeira linha da demo.

**Fim do `[...cortado]` nas justificativas.** O relatório cortava o texto do
juiz em 300 caracteres só para imprimir, e isso quebrava a leitura em voz
alta. Agora sai inteiro. **Era corte cosmético de tela, não truncamento do
dado** — e valia a pena resolver justamente porque o vídeo fala de
truncamento de verdade: ter os dois na mesma tela confundia.

### Risco de rede — tenha plano B

Hoje o Langfuse deu `ConnectTimeoutError` em duas tentativas seguidas e voltou
sozinho em seguida. A máquina tem o Avast interceptando TLS, o que ajuda a
explicar a intermitência.

**Antes de gravar, rode a demo uma vez.** Serve de teste de rede e já deixa a
conexão aquecida. Se falhar durante a gravação, o erro aparece limpo no
terminal (o pipeline não engole falha) — comente que é rede, corte, e rode de
novo.

---

## Slide 22 — divisor

Só anuncia. Não pare aqui.

---

## Slide 23 — Ler à mão

**FALA**

No vídeo passado eu terminei com um problema meu: cinco critérios escritos,
treze mediações gravadas, e uma pessoa só pra aplicar. Eu.

E olha, com três mediações ler à mão é o melhor jeito. É rápido, e eu pego
nuance que nenhuma ferramenta pega.

Com trinta por semana, eu paro na quarta-feira. Não é preguiça, é aritmética.

O critério não escala sozinho. Ele precisa de alguém que aplique sempre do
mesmo jeito, sem cansar na sexta.

---

## Slide 24 — Do critério ao veredito

**FALA**

O Claude entra aqui num papel oposto ao que ele teve o curso inteiro. Até
agora ele era quem respondia. Agora ele é quem julga.

São três peças.

**[aponta Trace]** O que aconteceu de fato. E aqui está a diferença que vale
a aula: não é só a resposta final. É o pedido, a resposta, cada ferramenta
chamada e o que cada uma devolveu. Bem mais do que eu olho quando leio à mão.

**[aponta Julgamento]** O critério foi atendido? É o árbitro confrontando a
execução com a régua que a gente escreveu. Sempre do mesmo jeito.

**[aponta Veredito]** Atendeu ou não atendeu. Nota por critério, com a
evidência que sustenta cada uma.

Isso tem nome na literatura: LLM as a judge. Um árbitro que não cansa na
sexta.

---

## Slide 25 — O que faz do modelo um juiz

**FALA**

Não basta pedir "avalie". Três instruções mudam tudo.

Julgue só com base no material. Não suponha nada. Se não está no trace, não
aconteceu.

Toda nota precisa de evidência citável. Justificativa genérica é
justificativa inválida.

E a terceira, que é a mais minha: seja severo com falha silenciosa. Um estado
errado que ninguém percebeu é pior que um erro barulhento. Erro barulhento
alguém conserta na segunda. Estado errado fica lá.

---

## Slide 26 — Nota sem evidência não vale nada

**FALA**

Guarda essa. Se o juiz te devolve "nota 0,3" e mais nada, você não ganhou
informação — ganhou um número pra discutir.

Nota te diz que tem problema. A justificativa te diz o que fazer. Sem a
segunda, a primeira é só ansiedade.

---

## Slide 27 — O juiz não faz conta

**FALA**

Regra de ouro do projeto, e ela vale pro juiz também: o modelo não faz
aritmética.

Primeiro o código apura os fatos. Quais ferramentas foram chamadas. Quantos
tokens saíram. Se bateu no teto. Se deu erro.

Isso entra no material já pronto, marcado como fato. O juiz usa e não
recalcula.

Aritmética é trabalho de código. Julgamento é trabalho do modelo. Misturar os
dois é como você ganha um número errado com cara de número certo.

---

## Slide 28 — Prompt não é contrato

**FALA**

E aqui a lição mais reaproveitável do curso inteiro.

Eu não peço pro juiz "responder em JSON". Eu **forço** a chamada de
ferramenta.

Por quê? Porque este produto já aprendeu isso na dor. Numa versão anterior o
prompt **pedia** pro agente registrar o consumo. Pedia com todas as letras. E
o modelo, às vezes, simplesmente não fazia. Não é desobediência. É
probabilidade.

A regra que ficou: pedir não garante, forçar garante.

E pra um juiz isso é ainda mais crítico. Se a saída dele não for estruturada
de verdade, você não agrega nada depois. Um juiz que responde em texto livre
é um juiz que você vai ter que ler na mão. Ou seja: voltamos ao slide do
começo.

---

## Slide 29 — 2.3.1 O juiz julga uma mediação

**TELA:** terminal limpo, fonte grande, janela cheia. Terminal JÁ na pasta do
projeto antes de gravar — rodar de outra pasta dá `Cannot find module`.

```
node evals/run-evals.js --dry-run --trace 9f8bb3c520bca952adff5825cf213c84
```

```
AÇÃO — demo no terminal. DRY-RUN, nada é gravado. Não abrir Langfuse.
Terminal JÁ na pasta do projeto antes de gravar (senão: Cannot find module).

AO COLAR O COMANDO — explique as três partes

"Deixa eu explicar o que eu tô rodando, porque cada pedaço importa."

run-evals.js  → é o pipeline de evals. Ele busca a interação, monta o material e chama o juiz.
--dry-run     → ele julga, mas NÃO grava a nota de volta. Eu quero te mostrar o juiz trabalhando, sem sujar o histórico.
--trace <id>  → em vez de pegar as últimas interações, eu fixo uma. Essa aqui, de agosto. Assim você vê exatamente a mesma que eu.

LEITURA DO RELATÓRIO — de cima para baixo, na ordem que ele imprime

1) Cabeçalho
"Olha o que ele anuncia: interações reais do Langfuse, um juiz, e os Scores voltando pro trace. É o caminho inteiro em uma linha."

2) Modo
"Modo dry-run, não grava. Está escrito ali."

3) Trace pinado
"É aquele id que eu colei."

4) mediar-cardapio
"A operação. Então os critérios que vêm agora são os do Mediador."

5) [1/1] — 22 de agosto
"Uma interação só. De agosto."

6) pedido
"Fazer risoto de camarão neste sábado."

7) ! sinal em codigo: truncamento por max_tokens   <- PARE AQUI, é o slide 27 acontecendo
"Repara: essa linha aparece ANTES de qualquer nota. E não é o juiz falando."
"É o código. Ele mediu os tokens de saída, comparou com o teto e marcou como fato."
"Aritmética é trabalho de código. O juiz vai receber isso pronto e não recalcular."

8) execucao_integra — X, zero, barra vazia
"Integridade: zero. A resposta foi cortada no meio da frase. Termina em 'nenhum delivery/restaur' e para."

9) trade_off_com_numeros — til, barra pela metade   (NÃO diga o número antes de ver: varia 0,5–0,6)
"Aqui ficou no meio termo. Números reais existem — um quilo de camarão, duzentos gramas de manteiga."
"Mas a mediação central, o vinho, não tem custo numérico associado. Ficou como observação de gosto."

10) numeros_de_tool — OK, um, barra cheia
"Números de ferramenta: um. Tudo que ele citou aparece literalmente no retorno das ferramentas. O juiz conferiu um por um."

11) mediou_sem_decidir — OK, um, barra cheia
"Mediou sem decidir: um. A receita pede branco, a casa prefere tinto. Ele não escolheu — perguntou: 'querem manter o branco ou preferem adaptar a receita?'"

12) falta_virou_trade_off — X, zero   <- A LINHA QUE VALE A AULA. PAUSA.
"E essa é a linha que vale a aula."
"O texto diz que o alho já foi para a lista de compras. O sinal do código diz que a ferramenta de lista nunca foi chamada."
"A falta foi resolvida na frase. Não foi resolvida no sistema."

13) juiz: 11268 tokens entrada / 782 saída
"E esse é o custo de julgar uma interação. Onze mil tokens de entrada."

14) RESUMO — média 0,50
"Metade. E metade aqui não é o produto mais ou menos: são dois critérios reprovados, com nome e evidência."

15) Última linha
"Dry-run: nenhum Score foi gravado. Nada do que você viu foi pro Langfuse."

EMENDA direto no slide 30.

ATENÇÃO
• A redação das justificativas MUDA a cada rodada. Leia da tela, parafraseie, nunca prometa a frase exata.
• trade_off_com_numeros oscila 0,5–0,6. Os quatro binários são estáveis (0,1,1,0) em 4 rodadas.
• Rede: rode uma vez antes de gravar. Deu ConnectTimeout hoje e voltou sozinho.
```

---

## Slide 30 — Ele enxerga o caminho inteiro

**FALA**

O Mediador escreveu "já coloquei o alho na lista de compras". Se eu estivesse
lendo à mão, eu acreditaria. Está escrito com convicção.

O juiz não acreditou. Porque ele não lê só a resposta. Ele lê o caminho
inteiro. E no caminho a ferramenta não aparece. A frase é bonita e a ação não
aconteceu.

Isso é falha silenciosa. Ninguém recebeu erro. A casa vai ao mercado achando
que o alho está na lista. E não está.

Foi por isso que eu pedi pro juiz ser severo com esse tipo de coisa. E foi
por isso que eu dei a ele o caminho inteiro, não só o texto.

Agora eu tenho um juiz. No próximo vídeo eu monto o conjunto: quais critérios,
quais operações, e o que eu decidi não medir.

**CORTE:** após "o que eu decidi não medir".

---

## Riscos

**A demo demora ~25 s de silêncio.** Tenha a fala do "enquanto roda" pronta,
senão vira pausa morta.

**As justificativas mudam de redação.** Nunca diga "ele vai dizer exatamente
isso". Leia da tela.

**Se o juiz devolver nota diferente** (não aconteceu em duas rodadas, mas é um
modelo): não corrija ao vivo. Comente o que apareceu — a tese do vídeo é que
o juiz enxerga o caminho inteiro, e ela se sustenta em qualquer nota.

**Não abra o Langfuse.** É `--dry-run`, nada é gravado, e o mergulho é a Aula 3.
