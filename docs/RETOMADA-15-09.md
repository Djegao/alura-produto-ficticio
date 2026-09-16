# Retomada — 15/09

> Escrito em 12/09, no fim do dia em que a **Aula 2 foi gravada por completo**.
> Substitui `RETOMADA-ESCRITORIO.md` como ponto de partida.

## Prompt para colar numa sessão nova

```text
Continuando a preparação do curso Alura "Evals, observabilidade e conformidade".
A Aula 2 foi gravada inteira em 12/09. Agora é a Aula 3 (observabilidade).

Antes de qualquer coisa:

1. Leia docs/RETOMADA-15-09.md e depois docs/aula2-4-ensaio.md (é o modelo de
   ensaio que funcionou: TELA, FALA desenvolvida, marcos por número de linha,
   riscos e demos validadas antes de escrever a fala).
2. Confirme o estado: produção em 401, chave da Anthropic respondendo, e se os
   traces das demos ainda estão no Langfuse (retenção ~30 dias).
3. Me diga em uma linha o que fazer primeiro.

Convenções que não devo violar:
- Falhas preservadas de propósito são conteúdo de aula. Não corrigir sem
  perguntar.
- Demo ao vivo se valida ANTES de escrever a fala. Rodar 2 ou 3 vezes e
  congelar os números; o que varia não entra em promessa.
- Não fazer deploy, merge nem push sem eu pedir.
```

## Estado em 12/09, fim do dia

| Item | Estado |
|---|---|
| Aula 2 | ✅ **gravada por completo** (2.1 a 2.4, com os três blocos de ação) |
| Branch | `gravacao/aulas-3-e-4-material`, tudo commitado e no remoto |
| Produção | ✅ 401, deploy de 12/09 (PRs #4 e #6 mergeados) |
| Chave Anthropic | ✅ responde 200 |
| Deck da Aula 2 | `slides/Aula 2 6498 - inicial.pptx`, 42 slides, notas em bullets |
| Próximo | **Aula 3 — observabilidade** |

## O que mudou na Aula 2 em relação ao plano antigo

O Langfuse **não** aparece na Aula 2. Todas as demos são `--dry-run`, no
terminal. A decisão de 12/09 foi manter a ferramenta para a Aula 3 e usar a
Aula 2 para critério e julgamento.

O **2.2.1** virou panorâmica do `criterios.md` como cheatsheet, não mergulho.

O **slide 28** ganhou uma saída de tela para o `run-evals.js` (linhas 462 e
523). Foi a correção de uma lacuna real: sem ela o aluno via a entrada e a
saída do juiz, nunca o meio, e não conseguiria reaplicar.

O **slide 34** deixou de listar os critérios do Mediador e passou a entregar
três perguntas agnósticas — Promessa, Verossimilhança, Papel.

## Pendências para depois da gravação

**`SYSTEM_JUIZ` ainda diz "Chef Caseiro"** (`evals/run-evals.js`, ~linha 453).
Não foi trocado porque altera o material que o modelo recebe e invalidaria as
demos congeladas. Trocar e revalidar rodando 2 ou 3 vezes.

**O resto do repo ainda usa o nome antigo** — cerca de 69 ocorrências de "Chef
Caseiro" e 10 de "Chef Ops" em `CLAUDE.md`, `SDD.md`, `prompts.js`, `agent.js`,
`server.js` e nos geradores de slide. O nome canônico é **Musa Balance**.
`evals/criterios.md` e a saída do terminal já foram uniformizados.

**Média geral do conjunto** (rodapé do `run-evals.js`): mistura critérios de
operações diferentes e não significa nada. A decisão foi mantê-la e criticá-la
na fala do 2.4, em vez de remover.

## Aprendizados de método que valem para a Aula 3

**Valide a demo antes de escrever a fala.** Duas demos tinham número fixo no
slide que não se sustentava: `trade_off_com_numeros` oscila 0,5–0,6 e
`ancoragem_no_texto` 0,3–0,4. Critério binário é estável; escala contínua não é.
Nunca prometer o número antes de ele aparecer na tela.

**A redação da justificativa do juiz muda a cada rodada.** Ler da tela e
parafrasear, nunca decorar.

**Ordem do terminal deve bater com a ordem do slide.** O `--trace` respeita a
ordem dos ids no comando; use isso para alinhar com a tabela.

**Rede intermitente.** O Langfuse deu `ConnectTimeoutError` duas vezes seguidas
e voltou sozinho — a máquina tem antivírus interceptando TLS. Rodar a demo uma
vez antes de gravar serve de teste e aquece a conexão.

**O PowerPoint trava o arquivo.** Nenhuma edição de notas por script funciona
com o deck aberto. Fechar antes de pedir alteração.
