# Backlog: "💬 Simular conversa" — modal de chat no painel

**Status:** documentado, não construído. Escopo definido durante ensaio de gravação (2026-08-12/13), pra construção em momento oportuno.

## Motivação

Hoje a única forma de simular uma troca de mensagens Diego↔Esposa com o produto é via Telegram (difícil de mostrar em gravação de tela) ou via Postman/curl direto no endpoint (funciona, mas exige alternar de janela e sair do produto). Falta uma superfície visual, dentro do próprio painel, pra demonstrar a conversa e a mediação sem sair do produto.

## O que já existe (nada novo no backend)

- `POST /api/relatos` — recebe `{texto, ator}`, classifica via Agente de Ingestão, retorna o tipo (`relato_refeicao`/`desejo`/`aquisicao`/`desperdicio`) e o que foi registrado.
- `POST /api/mediacao` — recebe `{promptText}`, roda o Agente Mediador, retorna o texto da resposta + trace.

Este backlog é **só front-end** — expõe o que já funciona, não duplica lógica.

## Proposta

1. **Botão novo** na barra de configuração: `💬 Simular conversa` — abre um modal centralizado, que não fecha ao enviar mensagem.
2. **Segmented control** no topo do modal: `Diego` / `Esposa` — define qual ator a próxima mensagem representa. Reaproveita as cores já existentes (`--accent` pro chef, `--terracotta` pra musa).
3. **Corpo do modal**: histórico em formato de chat — bolha da mensagem enviada + tag pequena logo abaixo mostrando a classificação (`desejo`, `relato`, `aquisição`...), no mesmo espírito do painel Atividade recente, só que inline e imediato.
4. **Campo de texto + Enviar**: chama `/api/relatos` com o ator selecionado no segmented control. Modal permanece aberto — trocar o segmented control simula o outro ator "respondendo", sem fechar nada.
5. **Botão separado dentro do modal**: `🍳 Perguntar ao Mediador` — chama `/api/mediacao`, a resposta aparece como bolha maior/destacada, visualmente diferente das bolhas dos atores (é a "voz" do agente, não de uma pessoa).

## Fora de escopo (de propósito)

- Não mexe no Telegram nem duplica nada da lógica de canal — é uma segunda porta de entrada pros mesmos endpoints que o bot já usa.
- Não tenta persistir "conversa" como conceito novo no banco — cada mensagem já vira `pensamentos`/`trade_off_decisions` normalmente, igual hoje.
- Sem histórico entre sessões do modal — abre vazio toda vez, é ferramenta de demonstração, não um novo canal de captura permanente.

## Onde construir

Front-end: `public/index.html` (markup do modal, mesmo padrão visual da gaveta de Configurações) + `public/app.js` (estado do segmented control, chamadas aos dois endpoints, render das bolhas). Nenhuma mudança em `server.js`/`tools.js`/`agent.js` necessária.
