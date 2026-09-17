# SDD pré-manufaturado — Episódio D (para debate em câmera)

> Escrito em 17/09. Você pediu SDD pré-manufaturada (não é sua a caneta do
> `SDD.md` como um todo — é aula de outro professor — então isso entra como
> **rascunho pronto pra debater detalhes ao vivo**, não pra colar direto).
> Segue o formato exato de `SDD.md` §11 (Observação/Diagnóstico/Restrição
> derivada/Onde), pronto pra entrar como **§11.7**, logo após `§11.6` (erro
> engolido em silêncio por fallback defensivo — é, aliás, o precedente mais
> parecido: os dois são "nada falhou visivelmente, mas nada aconteceu").

## Texto candidato a §11.7

---

### 11.7 Pergunta de guardrail sem persistência de estado — o ciclo nunca se fecha

**Observação:** quatro mensagens reais no Telegram (14/09/2026, 18h17–18h18),
cada uma classificada corretamente pelo agente de ingestão — e mesmo assim
o item preparado ("hambúrguer de patinho") nunca entrou no estoque. O
guardrail de porcionamento ("nunca chutar, sempre perguntar quando falta
número") disparou como projetado; o ciclo pergunta→resposta simplesmente
nunca se resolveu. Evidência completa em `docs/apoio/evidencia-porcionamento-patinho.md`
e `docs/aula4-investigacao-sdd.md`, Episódio D.

**Diagnóstico:** rodando o próprio framework de diagnóstico do produto
(prompt, dados ou modelo?) contra as quatro chamadas, nenhuma categoria
explica a falha — prompt correto, dados claros, modelo acertou a
classificação as quatro vezes. A causa é uma quarta categoria, arquitetural:
`ingerirRelato` (`relato-ingestao.js`) recebe só o texto da mensagem atual,
sem parâmetro de histórico — cada chamada começa do zero. Quando
`intencao-efeitos.js` monta uma `pergunta` no ramo `porcionamento`
(linha ~166) e falta só o número de porções, a função retorna sem persistir
nada (`if (!pergunta) { ...insert... }`, linha ~179) — não existe registro
de que uma pergunta ficou pendente, então a resposta seguinte é classificada
do zero, sem saber que é resposta a algo.

Isso contrasta com o único outro guardrail do produto que pergunta e
funciona: o fluxo de orçamento (`aguardando_categoria` +
`callback_data: bg:categoria:${pensamentoId}` em `telegram.js:71-79`)
**persiste** a pendência antes de perguntar, e a resposta chega ancorada
nela via botão — não depende de o usuário repetir contexto em texto livre.

**Restrição derivada:** toda pergunta de guardrail cuja resposta pode
chegar em mensagem separada precisa persistir um estado de "pendente" antes
de perguntar — nunca confiar em memória de conversa implícita nem assumir
que a próxima mensagem vai repetir o contexto que a pergunta já tinha.
"Perguntar em vez de chutar" (guardrail já defendido pelo produto) só é
seguro quando emparelhado com "guardar a pergunta em algum lugar que a
próxima mensagem consulta antes de classificar do zero". **Segunda parte,
adicionada em 17/09:** persistir a pendência não é suficiente por si só —
uma pendência que nunca resolve e fica muda pra sempre é o mesmo tipo de
falha silenciosa que §8 já proíbe noutro contexto (fallback `|| []`,
§11.6). Toda pendência precisa de um destino final visível: resolvida
(`completo`) ou **expirada, com aviso explícito** — nunca "esquecida sem
sinal".

**Onde:** `intencao-efeitos.js` (ramo `porcionamento`, ~linha 147-169),
`telegram.js` (ponto de entrada de mensagem, antes da classificação),
schema `pensamentos` (novo valor de `status` + campo pra guardar o item
pendente), e um job novo — mesmo padrão de `lembrete.js` (setInterval,
`avisar()`), mas de minutos em vez de hora em hora — que expira pendências
mais velhas que a janela e avisa: *"Ingestão não concluída por falta de
porções: {item_pendente}."*

---

## Pontos pra debater ao vivo (de propósito deixados em aberto)

Isso é o que sobra pra "debater detalhes dele em câmera" — não decidi
sozinho porque são decisões de produto, não só de código:

1. **Nome do novo `status`.** Proponho `aguardando_porcoes` (simetria com
   `aguardando_categoria`, já existente). Alternativa: `pendente` genérico,
   reutilizável pro próximo guardrail que precisar do mesmo padrão (mais
   alinhado ao P2 do backlog, que generaliza — mas maior escopo pra hoje).
2. **Onde guardar o item pendente.** `pensamentos` não tem hoje um campo
   pra isso — precisa de `alter table` (`item_pendente text`, ou reusar
   `descricao`). Column nova é mais explícito; reusar `descricao` é zero
   migração. Recomendo coluna nova, é uma linha de SQL e fica mais honesto
   pro eval consultar depois.
3. ~~**Janela de expiração.**~~ **Resolvido em 17/09:** 10 minutos (folga
   generosa sobre o ~1 min real do incidente). Passou a ser mais que um
   parâmetro do eval — vira comportamento real do produto: um job (mesmo
   molde de `lembrete.js`) marca a pendência como `expirada` e avisa a
   casa explicitamente ("Ingestão não concluída por falta de porções: X"),
   em vez de deixá-la muda pra sempre. Ideia do Diego, 17/09 — fecha a
   lacuna que a v1 deste desenho deixava aberta (pendência persistida, mas
   sem destino visível se nunca resolvida).
4. **Escopo do fix.** Only porcionamento (Episódio D) ou generalizar pro
   padrão valer pra qualquer guardrail futuro (P2 do backlog)? Recomendo
   só porcionamento hoje — é o que tem caso real pra validar ao vivo contra
   produção; generalizar sem um segundo caso real é especular.
