# Aula 3 — pré-flight, "se der errado" e o que o aluno leva

Anexo operacional de [`aula3-script.md`](../aula3-script.md). Os números
estão em [`aula3-dados-congelados.md`](./aula3-dados-congelados.md).

**Terminal desta aula: PowerShell**, na pasta do projeto. O caminho tem
espaço, então precisa de aspas:

```powershell
cd "D:\TIME_CINTHIA\6498 - Evals conformidade e observabilidade\chef-caseiro"
```

---

## 1. Antes do REC (vale pros quatro vídeos)

| Item | Como deixar | Conferir com |
|---|---|---|
| Produção | no ar | `curl.exe -s -o NUL -w "HTTP %{http_code}\n" https://chef.workshopee.com.br` → **401** |
| Números | batendo com os slides | `node scripts/aula3-retrato-langfuse.js` |
| Observabilidade local | **LIGADA** | `powershell -File scripts/observabilidade.ps1 status` |
| Servidor local | **parado** (sobe no 3.2) | nenhum `npm start` rodando |
| Langfuse | logado, projeto do produto, janela de 30 dias, aberto uma vez antes pra aquecer a rede | — |
| Nome do projeto no Langfuse | decidido (decisão 14 do debate) | — |
| Telegram | **não usar durante a gravação** | — |

**Janelas pra alt+tab:** 1. deck · 2. Langfuse · 3. terminal · 4.
`localhost:3300` (só no 3.2) · 5. este documento.

**Divisores azuis são a claquete da edição:** segure **2 s em silêncio** em cada
um, antes de falar. Vale também pros divisores de ação (3.2.1 e 3.2.2).

---

## 2. Pré-flight do 3.2 (a única demo com efeito)

### As três armadilhas (herdadas do ensaio de 14/09, ainda válidas)

1. **Reinicie o servidor a cada liga/desliga.** As chaves são lidas uma vez,
   na subida. Sem `Ctrl+C` + `npm start`, nada muda e a demo não prova nada.
2. **Nunca pelo Telegram.** O webhook aponta pra produção, que continua com o
   rastro ligado. A mensagem vai aparecer no Langfuse mesmo com o local
   desligado, e a demo prova o contrário. Use só o painel em `localhost:3300`.
3. **O local escreve no banco de produção.** Por isso as frases são **desejo**:
   entra 1 item no feed, sem mexer em estoque nem em lista de compras e sem
   mandar nada pro grupo do Telegram (conferido em `intencao-efeitos.js`).

### Validar fora do ar (círculo 1 do debate)

- [ ] Com `off` + `npm start`: aparecem as **2 linhas `[WARN]`** na subida?
      Aparece **mais alguma linha** quando uma mensagem é enviada? Se aparecer,
      ajustar a fala do slide 8 ("uma vez, na hora de ligar").
- [ ] Mandar **uma** frase de desejo de teste (ex.: "Bateu vontade de pão de
      queijo") e confirmar que vira **desejo** no feed. Isso deixa 1 item no
      feed; apagar depois se quiser.
- [ ] Com `on` + `npm start`: a interação aparece no Langfuse em quanto tempo?
      (referência: ~45 s)
- [ ] Voltar pra **LIGADA** e conferir com `status`.

### Coreografia do lag

Mande a frase → **volte pro slide 10** e fale por um minuto → só então abra o
Langfuse. Não fique olhando a tela vazia.

### Interações pra abrir na tela

| Pra quê | Qual | Visível até |
|---|---|---|
| Mensagem curta, 2 passos (3.2·4) | "comprei maçãs: 433g, R$9,89/kg" — 29/08, 13h12, `a40386707d11` | ~28/09 |
| Mediação, 12 passos (3.2·4 e 3.4·4) | 03/09, 16h36, `1ecca5e617e2` | ~02/10 |
| Interação com nota (3.2·4, coluna Score) | `efae9192…` (22/08) ou `078afc7fb4e4` (24/08) | ~21/09 / ~23/09 |

---

## 3. Se der errado

**3.2 — o `[WARN]` não apareceu.** Não afirme que ele existe. Troque a fala do
slide 8 por: "e repara: nada no terminal me avisou". A tese do slide continua
de pé: o aviso, se existe, não chega em ninguém.

**3.2 — a interação não apareceu depois de ligar.** Espere até 2 min antes de
concluir que falhou. Se passar disso, siga com uma interação antiga: "o depois
também dá pra mostrar com dado de ontem".

**3.2 — o script diz "Já está desligado".** Rode `status`. Se ficou num estado
intermediário, `on` devolve as chaves guardadas.

**3.2 — a frase virou outro tipo** (não desejo). Não corrija no ar. Siga: o
ponto é o rastro existir ou não, não o tipo.

**3.2 — nenhuma interação com nota na lista** (a partir de 23/09). Mostre as
notas na página de notas do Langfuse (listadas até ~27/09) ou diga: "as notas
da aula passada ficam grudadas na interação; as minhas já passaram dos 30
dias". É o mesmo assunto do 3.3·9.

**3.3 — números diferentes dos slides.** O slide é a foto de 16/09. Diga: "o
painel já andou desde que eu tirei essa foto". A partir de 21/09, use as falas
marcadas no script.

**3.4 — `1ecca5e6` não abre** (rede ou retenção). Narre pela tabela do slide 2
e pelo extrato em `traces-preservados/aula3-mediacoes-e-erros-16-09.json`
(tokens de saída 2.048 e 1.024).

**Frase âncora, se travar:** *"Um padrão não é um tipo de sintoma. É uma
assinatura que se repete."*

---

## 4. Depois de gravar

- [ ] `powershell -File scripts/observabilidade.ps1 status` → **LIGADA**
- [ ] Servidor local parado
- [ ] (Opcional) apagar do feed as frases de desejo da demo
- [ ] Não corrigir nada do que apareceu na aula sem decidir antes (convenção do
      projeto): teto do Mediador, "(proposta registrada sem texto)", nota por
      foto marcada como erro

---

## 5. O que o aluno leva

### 5.1 Faça como eu fiz — 3.2

1. Criar conta no Langfuse Cloud, plano **Hobby** (gratuito: 50 mil
   registros por mês, 30 dias de acesso ao dado).
2. Criar um projeto e gerar as chaves nas configurações do projeto.
3. Colar as três informações (chave pública, chave secreta, endereço) na
   configuração do próprio produto, **fora do código**.
4. Usar o produto uma vez, esperar ~1 minuto e abrir a interação.
5. Desligar, usar de novo, e confirmar que **nada** aparece.

> Rótulos de menu mudam entre versões do Langfuse. Antes de publicar, conferir
> na tela e escrever aqui o caminho exato.

### 5.2 O pedido pro assistente de código (Claude Code, Lovable, Cursor)

```text
Quero instrumentar este projeto com o Langfuse (Langfuse Cloud, plano gratuito).

Regras que não posso abrir mão:
1. Nenhuma chamada a modelo de IA pode acontecer fora de um registro do
   Langfuse. Cada interação do usuário vira um registro, e cada chamada ao
   modelo ou a uma ferramenta vira um passo dentro dele.
2. A instrumentação carrega antes de qualquer outro código do projeto.
3. As chaves ficam fora do código, em configuração que não vai pro
   repositório.
4. Cada passo registra o que entrou, o que saiu, o modelo e os tokens.
5. Nenhum erro engolido: se algo falhar, o registro fica marcado como erro,
   com a mensagem real.

Antes de mudar qualquer coisa, me explique em linguagem simples: quais partes
do projeto chamam modelo de IA, o que vai mudar em cada uma e onde eu colo as
três informações do Langfuse. Depois me diga como confirmar no painel que
funcionou.
```

> Atenção, que é o fio da Aula 5: o rastro grava o que o usuário escreveu. Se o
> produto recebe dado pessoal, isso vai pra nuvem do Langfuse junto.

### 5.3 Quatro perguntas pro seu painel — 3.3

| Pergunta | Onde olhar | No meu produto (16/09) |
|---|---|---|
| O que ele mais faz? | contagem de interações por operação | entender mensagem: metade |
| Onde estão o dinheiro e a espera? | custo e pior caso, por operação (no painel inicial: custo e latência p50–p99) | Mediador: 90% da conta, até 113 s |
| Quantas terminaram inteiras? | erro, e também resposta cortada ou vazia | 6 vermelhos (1 não era falha); das 7 mediações sem alarme, 1 inteira |
| Melhorou desde a semana passada? | nota ao longo do tempo | não sei: uma rodada só de notas |

### 5.4 Como achar um padrão — 3.4

| Pergunta | O que fazer | Exemplo |
|---|---|---|
| **Assinatura:** que sinal se repete, com sintoma diferente? | agrupar por um sinal conferível, não pelo que o usuário viu | tokens de saída = teto |
| **Frequência:** é um caso ou é regra? | contar, e dizer o tamanho da amostra | 9 de 10 mediações |
| **Ponto cego:** onde o sem-alarme pode estar mentindo? | cruzar com o estado final, com a mensagem seguinte e com o que deveria ter deixado rastro | "Consultei", sem alarme; a lasanha; o hambúrguer; a foto sem rastro |
