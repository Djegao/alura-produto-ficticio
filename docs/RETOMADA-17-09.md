# Retomada — 17/09

> ## ⏩ Atualização 17/09, tarde — LEIA ESTA SEÇÃO PRIMEIRO
>
> O que está abaixo desta caixa é o estado da manhã (planejamento). À tarde,
> as pendências foram decididas e o fix foi implementado.
>
> **Branch de trabalho:** `aula4/fix-episodio-d-porcionamento` (ainda
> **não mergeada** — o PR sai depois do smoke test). Trabalhe a partir dela.
>
> **Decisões do Diego (17/09, tarde):**
> 1. Janela de expiração: **20 min**, com o debate **deixado aberto** na
>    apresentação. O concierge lembra que ele considerou até 120 min e
>    recuou pelo risco de porção cair no prato errado (mesmo ator com mais
>    de um prato pendente).
> 2. Implementação real **antes** da gravação — em câmera, código/migração/
>    deploy/PR viram leitura do que foi feito; smoke test fica ao vivo.
> 3. Nome do status `aguardando_porcoes`, coluna `item_pendente`, escopo só
>    porcionamento: **confirmados**.
>
> **Estado técnico:**
> | Item | Estado |
> |---|---|
> | Migração Fase 7 (`schema.sql`) | ✅ rodada no Supabase e verificada |
> | Fix (`intencao-efeitos.js`, `expiracao-porcionamento.js`, `server.js`, `public/app.js`) | ✅ commitado; resolvido, re-pergunta e expirado testados contra o banco real |
> | Deploy Railway | ✅ no ar (deploy `118df82a`, 14:58, já com o filtro de `<UNKNOWN>`) |
> | Smoke test no Telegram (resolvido + expirado) | ✅ os dois passaram: frango resolvido 14:59 (3 porções no estoque), sopa expirada 15:08 com aviso no grupo |
> | Backfill da linha histórica de 14/09 (disclosed) | ✅ inserido (trace `240ad5bb32…`, status `expirada`) |
> | Script do eval multi-trace | 🔴 não existe — o roteiro (passo 5.4) prevê escrever ao vivo; plano B é o banco já ter os dois casos |
> | PR + merge | 🔴 pendente (`gh` não instalado; mostrar branch/commits no GitHub) |
> | Lixo de teste no banco | 🟡 "frango desfiado 500 g" (compra) + pensamento dela seguem lá, aguardando ok do Diego |
>
> **Decisões da tarde:** D1 = **A** (não mexer na soma 2+2; o fechamento diz
> que o prato chega com o número de porções, mas sem o peso de cada uma).
> Eixo de ingestão **continua no Haiku** — o Sonnet 5 soma sozinho e devolve
> `item_nome: "<UNKNOWN>"`, o que quebraria o fix.
>
> **Achado novo (17/09, tarde):** a mensagem 3 real ("2 unidades de 220g e
> 2 de 160g") nunca traz número — somar é conta, a LLM não faz. O fix
> re-pergunta ancorado no prato, mas não resolve sozinho. E a mensagem 2,
> hoje, às vezes vem com o 4 já somado pelo Haiku. Detalhes no topo de
> `docs/aula4-concierge-codigo-episodio-d.md`.
>
> **Roteiro da aula — mapa completo e decisões ainda abertas:**
> `docs/aula4-concierge-debate-e-fechamento.md` (episódios 2 e 7 novos,
> tabela com todos os 7 episódios, ordem de gravação). Três decisões em
> aberto lá: **D1** soma 2+2 (recomendado: não mexer, contar em câmera),
> **D2** fundir episódio 3 com cap. 4.4.1 (recomendado: fundir), **D3**
> disparar o caminho expirado antes de gravar (recomendado: sim).
>
> ### Prompt para a janela do slide deck
>
> ```text
> Vou montar o slide deck do novo meio da Aula 4 (episódio D, ciclo completo)
> do curso Alura "Evals, observabilidade e conformidade".
>
> 1. git fetch e checkout da branch aula4/fix-episodio-d-porcionamento.
> 2. Leia docs/RETOMADA-17-09.md, só a caixa "Atualização 17/09, tarde".
> 3. Leia, nesta ordem: docs/aula4-concierge-debate-e-fechamento.md (mapa e
>    decisões D1-D3), docs/aula4-sdd-pre-manufaturado-episodio-d.md,
>    docs/aula4-concierge-codigo-episodio-d.md,
>    docs/aula4-concierge-evals-episodio-d.md. Cada um tem "Slide sugerido".
> 4. Convenção: deck só depois do debate. Antes de gerar qualquer .pptx,
>    confirme comigo D1, D2 e D3 e me mostre a lista de slides (título +
>    tipo) em texto. Siga o formato e o gerador dos decks das Aulas 2/3
>    (veja slides/ e generate-slides.js).
> 5. Outra sessão está cuidando de deploy, smoke test e PR na mesma branch —
>    não mexa em código do produto; commite só material de slide.
> ```

> Escrito em 17/09, sessão de planejamento antes da gravação (adiantada de
> 18/09 para hoje). Substitui `RETOMADA-16-09.md` como ponto de partida.
> Esta sessão não gravou nada — só planejou o redesign da Aula 4 e deixou
> o ambiente pronto pra continuar noutra máquina (computador da escola).

## Prompt para colar numa sessão nova

```text
Continuando a preparação do curso Alura "Evals, observabilidade e conformidade".
Estou no computador da escola/estúdio, retomando uma sessão de planejamento
feita em outra máquina em 17/09.

Antes de qualquer coisa:

1. Leia docs/RETOMADA-17-09.md por completo — é o estado exato de onde parei.
2. Confirme que os 4 documentos novos do redesign da Aula 4 estão presentes:
   docs/aula4-redesign-ciclo-completo.md, docs/aula4-sdd-pre-manufaturado-episodio-d.md,
   docs/aula4-concierge-codigo-episodio-d.md, docs/aula4-concierge-evals-episodio-d.md.
3. Preciso recriar o .env nesta máquina (ver seção "Ambiente" abaixo) antes
   de qualquer migração/deploy real.
4. Me diga em uma linha o que fazer primeiro, considerando as decisões
   pendentes listadas em "O que ainda falta decidir".
```

## Estado em 17/09, fim da sessão de planejamento

| Item | Estado |
|---|---|
| Redesign do Módulo 4 | ✅ decidido — ciclo completo real, episódios fundidos, não linear ao espelho |
| Documentos de roteiro/plano novos | ✅ escritos (4 arquivos, ver abaixo) |
| `aula4-script.md` (4.2–4.4) | ✅ marcado como superado, apontando pro material novo |
| Implementação real (código/migração/deploy/merge) | 🔴 **não iniciada** — bloqueada em decisões pendentes (ver abaixo) |
| `.env` desta máquina | 🟡 criado com chaves em branco, aguardando você colar os valores reais — **não vai existir na próxima máquina**, precisa recriar |
| Push desta branch | fazer ao final desta sessão, pra este material chegar na próxima máquina |

## O que foi decidido nesta sessão

**Contexto do pedido original:** o Diego achou o Módulo 4 antigo (4.1–4.5)
fraco tecnicamente — o diagnóstico ficava "descolado" do ciclo completo.
Decisão: refazer 4.2–4.4 como uma aula única e orgânica, no espírito da
Aula bônus 2.5 (`docs/aula-bonus-evals-do-zero-roteiro.md`), mas **real**
(código, eval, merge de verdade — não simulado como a 2.5) e **não linear
ao espelho** — episódios livres, seguindo a fluidez de um trabalho de
produto real: diagnosticar → decidir → SDD → código → evals → observar →
fechar.

**Episódio central: D — "o hambúrguer que sumiu"** (causa arquitetural:
falta de memória de conversa; `docs/aula4-investigacao-sdd.md`). Episódio
C (lasanha/lasagna) fica intocado — é o gancho de abertura da Aula 5,
confirmado no `CLAUDE.md`.

**Estrutura final dos episódios (fundida em 6, não 7 — "debate" foi
absorvido dentro do episódio de código):**
1. Diagnóstico (recap, material já congelado)
2. SDD + decisão do caminho (debate vira apresentação de decisões já
   tomadas — Diego disse que vai "apresentar com decisões já tomadas",
   não descobrir ao vivo)
3. Código real (migração + fix + job de expiração + deploy + merge)
4. Evals (critério novo multi-trace)
5. Observabilidade (antes/depois no Langfuse)
6. Fechamento do módulo

**Achado importante desta sessão, incorporado ao desenho:** a pendência
persistida (fix do Episódio D) não bastava por si só — se a pergunta nunca
fosse respondida, ela ficaria muda pra sempre, violando a regra "nunca
falhar em silêncio" (`SDD.md` §8). Ideia do Diego: um job de expiração que
marca a pendência como `expirada` e avisa explicitamente: **"Ingestão não
concluída por falta de porções: {item}."** Isso também simplificou o eval
(lê `status` direto, não recalcula janela).

**Discussão sobre a janela de expiração (ainda sem valor final — ver
pendências):** não há custo de API em janela maior (o job não chama LLM).
O risco real de janela longa não é confusão entre pessoas (já filtrado por
`actor_id` — mensagem de outro ator nunca entra nessa checagem) nem por
tipo de mensagem (só `porcionamento` sem nome de prato entra) — é **o
mesmo ator acumular mais de um prato pendente** dentro da janela e a
quantidade certa ir pro prato errado, silenciosamente. Janela curta (10
min) reduz esse acúmulo; algo como 20-30 min foi sugerido como meio-termo
razoável, mas **Diego não confirmou o valor final**.

## Documentos criados nesta sessão

- [`docs/aula4-redesign-ciclo-completo.md`](aula4-redesign-ciclo-completo.md)
  — plano geral, mapeia os 7 passos originais (agora 6, fundidos) ao
  Episódio D, com o desenho técnico levantado direto do código real
  (`telegram.js`, `intencao-efeitos.js`).
- [`docs/aula4-sdd-pre-manufaturado-episodio-d.md`](aula4-sdd-pre-manufaturado-episodio-d.md)
  — a entrada candidata a `SDD.md` §11.7, com as decisões de negócio já
  fechadas (status, coluna, escopo) exceto a janela de expiração.
- [`docs/aula4-concierge-codigo-episodio-d.md`](aula4-concierge-codigo-episodio-d.md)
  — roteiro Tela·Fala·Ação + capítulos/slides sugeridos pro episódio de
  código real: 7 capítulos (fechar desenho → migração → prompt
  persistência → prompt expiração → deploy → smoke test duplo → PR/merge).
- [`docs/aula4-concierge-evals-episodio-d.md`](aula4-concierge-evals-episodio-d.md)
  — roteiro Tela·Fala·Ação pro episódio de evals: critério novo
  `ciclo_pergunta_resposta_resolvido`, lê `status` direto (sem recalcular
  janela), inclui instrução de **backfill disclosed** do trace histórico
  de 14/09 (`240ad5bb32...`) — o bug original nunca persistia pendência,
  então essa linha precisa ser inserida à mão, com fala de transparência
  já escrita pra usar em câmera.
- `docs/aula4-script.md` — seções 4.2–4.4 marcadas como superadas
  (registro histórico, não roteiro), com aviso apontando pro material
  novo. 4.1 e 4.5 seguem valendo.

## O que ainda falta decidir (bloqueando a implementação real)

1. **Valor final da janela de expiração** — 10 min (conservador) ou algo
   como 20-30 min (menos frustração, risco de acúmulo ainda baixo)? Sem
   isso, o capítulo 4.4.2 (migração) e 4.4.4 (job) do concierge de código
   não têm número final pra usar.
2. **Onde a implementação real acontece** — perguntei e o Diego ainda não
   respondeu: (a) agora, nesta/próxima sessão, com credenciais reais
   coladas no `.env`, migração+deploy+merge de verdade antes da gravação;
   ou (b) só na hora da gravação, com ele no controle. A resposta muda o
   que a próxima sessão deve fazer primeiro.
3. **As outras 3 decisões da SDD (nome do status, coluna, escopo) foram
   recomendadas por mim mas nunca confirmadas explicitamente** — assumir
   como fechadas (`aguardando_porcoes`, `item_pendente`, só porcionamento)
   a menos que o Diego diga o contrário na próxima sessão.

## Ambiente — o que precisa ser recriado na próxima máquina

- **`.env`** não é versionado (está no `.gitignore`) e não viaja com o
  git — precisa ser recriado do zero na máquina da escola. Lista completa
  de variáveis (`docs/aula4-concierge-...` não cobre isso, é o `CLAUDE.md`,
  seção "Segredos — como recriar o `.env`" — **nota: o `.env.example` do
  repo está incompleto**, falta `ANTHROPIC_API_KEY` e
  `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` nele; não corrigido nesta
  sessão, achado à parte).
- **Railway CLI** (`railway login` + `railway link` no projeto
  `chef-caseiro`) — necessário só quando for a hora de fato fazer o
  deploy real (capítulo 4.4.5 do concierge de código).
- **`gh` CLI** — necessário pro merge real (capítulo 4.4.7).
- Esta sessão **não tinha `.env`** nem Railway/gh autenticados
  localmente — nenhuma migração ou deploy foi executado, tudo ficou em
  planejamento e documento.

## Convenções que não mudaram (reforçando, não repetindo tudo do CLAUDE.md)

- Falhas preservadas de propósito são conteúdo de aula — Episódio C
  continua intocado, é gancho da Aula 5.
- Backfill de evidência histórica é permitido quando **disclosed** em
  fala — nunca apresentar dado reconstruído como se fosse coletado ao
  vivo sem avisar.
- Aritmética é sempre código — o eval novo não recalcula nada, só lê
  `status` que o produto já decidiu.
