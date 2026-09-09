# Checklist de conformidade — produtos com IA

Checklist prático, aplicável a qualquer produto com IA em produção. Cada
item tem a pergunta que você precisa saber responder, e a coluna "como o
Chef Caseiro está hoje" mostra o estado real do produto de referência do
curso — **sem maquiar**: alguns itens estão em falta de propósito ou por
decisão consciente de escopo, e isso é dito com todas as letras. Usado no
vídeo [5.4](./aula5-roteiro.md#54--checklist-de-conformidade-tempo-não-informado-no-csv).

## Guardrails

| Item | Pergunta | Como o Chef Caseiro está hoje |
|---|---|---|
| Saída estruturada crítica não depende só de prompt | Toda vez que o produto **precisa** de um formato/ação específica, isso é garantido por API (`tool_choice`), não só pedido em linguagem natural? | **Sim.** Padrão de projeto desde o achado §11.3 do SDD — `agent.js` (`registrar_itens_usados`), `nota-fiscal.js` (extração inteira), juiz de evals (Aula 2). |
| Dado externo é validado antes de confiar | Entradas vindas de fora do seu controle (URL, upload, mensagem de canal) passam por validação de formato/domínio antes de qualquer chamada cara ou de rede? | **Sim, no caso do SEFAZ.** `sefaz.js` exige domínio `.gov.br` + chave de 44 dígitos antes de fazer fetch. |
| O produto pergunta em vez de estimar quando falta informação | Quando um dado necessário não foi dito explicitamente, o produto pergunta, ou assume um valor plausível sozinho? | **Sim, no porcionamento e na resolução de falta na lista de compras.** `intencao-efeitos.js` retorna `pergunta` em vez de gravar estimativa. Não é regra geral do código — é aplicada onde já foi identificada como necessária. |
| Saída de IA que vira ação pública é conferida antes de publicar | Se a IA escolhe algo que será mostrado/enviado a um usuário (link, recomendação), existe checagem determinística antes do envio? | **Sim, na receita premium.** `receita-premium.js` confere a URL escolhida contra o feed RSS real antes de postar no Telegram. |
| Acesso a recurso pago tem limite de custo | Existe alguma barreira (autenticação, rate limit, cota) entre "qualquer pessoa na internet" e uma chamada que custa dinheiro real? | **Parcial.** Basic Auth no deploy público (`APP_USER`/`APP_PASSWORD`) é obrigatório em produção. **Sem** rate limit por usuário/IP — a barreira é só de acesso, não de uso após autenticado. |
| Cálculo determinístico não é feito pela LLM | Prazo, decaimento, soma financeira, matemática de negócio — isso é sempre código, nunca pedido ao modelo pra "calcular"? | **Quase sempre — com uma exceção conhecida e documentada.** Regra de ouro do projeto (SDD §13.2). Exceção real: o agente de ingestão somou "4 + 1 = 5" porções ao interpretar um relato (SDD, achado registrado em 2026-08-21) — aritmética simples feita pela LLM, no limite da regra, preservada como discussão aberta, não corrigida. |

## Transparência

| Item | Pergunta | Como o Chef Caseiro está hoje |
|---|---|---|
| Nenhum caminho termina em silêncio | Toda falha, limitação ou entrada não suportada gera alguma resposta ao usuário — nunca "nada acontece"? | **Corrigido para o canal Telegram a partir do PR #4** (episódios A e B da Aula 4) — antes disso, formatos não suportados (foto/áudio) geravam um `return` mudo, sem log nem resposta. Ainda vale checar caminho a caminho; não é uma garantia estrutural única. |
| O produto diz o que não sabe fazer | Quando o usuário pede algo fora do escopo atual, o produto admite a limitação, em vez de ignorar ou inventar? | **Sim, desde o PR #4.** Resposta real do bot: "ainda não sei ler foto de cupom, me manda o link do QR ou o texto". |
| Erros não são engolidos por tratamento defensivo | Um `catch`, um `\|\| []`, um `try/catch` vazio nunca escondem uma falha real que deveria aparecer? | **Corrigido onde já foi encontrado** (achado §11.6 do SDD — `server.js`, convenção `semSilencio`), mas é convenção adotada caso a caso, não uma checagem automática que cobre o código inteiro. |
| Falha silenciosa de estado é monitorada, não só falha de canal | Além de "o sistema respondeu?", existe verificação de que o dado gravado bate com o que foi dito? | **Não.** É exatamente o episódio C (match `lasagna`/`lasanha` que não decrementa estoque) — preservado de propósito como conteúdo de aula, sem correção aplicada. Item **em falta**, com decisão documentada de manter assim para o curso. |

## LGPD / dados pessoais

| Item | Pergunta | Como o Chef Caseiro está hoje |
|---|---|---|
| Mapeamento do que é dado pessoal | Toda coluna/campo que identifica uma pessoa real ou seus hábitos está identificada como dado pessoal, mesmo quando não é óbvio (CPF, e-mail)? | **Sim, documentado.** `telegram_chat_id`/`telegram_user_id` (identificação) e `pensamentos` (rotina/hábito de consumo da casa) reconhecidos como dado sensível de rotina familiar em `CLAUDE.md`. |
| Controle de acesso a nível de linha (RLS) | O banco impede, por si só, que uma credencial vazada de um tenant leia dados de outro? | **Não — desligado de propósito.** Decisão documentada (`SDD.md §13.8`): household único, sem multi-tenancy real; a proteção de fato é que só `SUPABASE_SERVICE_ROLE_KEY` (nunca exposta ao browser) toca essas tabelas. **Não seria aceitável assim num produto multi-tenant real** — item listado como pendência honesta, não como solução. |
| Minimização de dado coletado | O produto coleta só o que precisa pra funcionar, ou acumula dado "por via das dúvidas"? | **Majoritariamente sim** — `pensamentos` é o log funcional que vira o feed do produto (não é telemetria oculta), mas é também o item mais sensível do schema, o que aumenta o peso de qualquer decisão de retenção. |
| Política de retenção/exclusão | Existe um mecanismo (mesmo que manual) para excluir dado de um usuário que peça, ou para expirar dado antigo automaticamente? | **Não existe.** Sem TTL, sem rota de exclusão, sem processo documentado de atendimento a pedido de titular. Item **em falta**, sem prazo definido — reconhecido aqui pela primeira vez em documento formal do projeto. |
| Segredo de acesso não é credencial de terceiro | As credenciais que protegem o acesso ao produto (não aos dados dos usuários) estão claramente separadas de credenciais de serviço externo? | **Sim.** `APP_USER`/`APP_PASSWORD` documentado como "gate de acesso da app, não uma credencial de terceiro" — pode ser reusada ou trocada livremente, ao contrário de `ANTHROPIC_API_KEY`/chaves do Supabase/Langfuse. |
| Segredos nunca versionados ou expostos em log | `.env` fora do controle de versão, nenhuma rotina de deploy imprime segredo em stdout/log? | **Sim, com um incidente documentado e corrigido no processo.** `.env` no `.gitignore`; achado operacional (SDD §11.5) sobre extração de segredo via stdout corrompendo o valor — corrigido no processo de deploy (ler `.env` direto do arquivo, não via `process.env` depois de log). |

## Como usar este checklist em outro produto

1. Rode as três seções (guardrails, transparência, LGPD) como perguntas
   sim/não/parcial — não pule pra "parcial" sem escrever o que falta pra
   virar "sim".
2. Todo item marcado como pendência precisa de uma decisão explícita
   registrada (aceito o risco / vou corrigir até X) — nunca deixe um "não"
   sem dono.
3. Revise depois de qualquer mudança de escopo (novo canal, novo tipo de
   dado, produto virando multi-tenant) — vários "sim" deste checklist (por
   exemplo RLS desligado) só são aceitáveis no escopo atual do Chef
   Caseiro, e viram "não" automaticamente fora dele.
