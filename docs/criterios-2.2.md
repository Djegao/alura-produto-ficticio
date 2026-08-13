# Critérios — Aula 2.2 (material de apoio, sem código)

## Cenário (o que aconteceu de verdade, nesta ordem)

1. Nota fiscal processada: camarão, arroz arbóreo, vinho branco, manteiga, parmesão, cebola, caldo caseiro (trace `9c9b38a329bd2ea6a11a542876824bfc`).
2. Esposa: *"Poderíamos fazer aquele risoto de camarão nesse sábado?"* — classificado como desejo.
3. Diego: *"Adorei a ideia! Só lembra que ainda temos marmitas de lasanha sobrando desde semana passada"* — classificado como desejo (lembrete de restrição).
4. Contexto adicional já existente: 3 relatos de fora recentes (McDonald's, pizza, jantar japonês) e uma marmita de lasanha em Consumo (3 de 4 porções restantes).
5. Mediador disparado: *"Bom dia! Me ajuda a pensar o cardápio desse fim de semana?"*

## Critério vago (ponto de partida)

> "A resposta do Mediador foi boa."

Não é checável sem opinião pessoal — é o problema que os critérios abaixo resolvem.

## Critérios (checáveis, sim/não)

1. Menciona explicitamente que existem porções caseiras não consumidas?
2. Cita o relato de delivery/restaurante recente como parte do motivo?
3. **Não** decide sozinha o que a casa deve fazer — expõe e deixa a escolha em aberto?
4. Usa números reais (porções restantes, dias desde o preparo) em vez de estimativa vaga?
5. **Não** inventa prazo de validade que não veio de cálculo em código?

## Evidência — aplicando nos dois casos reais

**Trace `3d78e29ce5a343d66c5781692dce2748` (§11.7 do SDD — resposta vazia):**

| Critério | Resultado |
|---|---|
| 1. Menciona porções não consumidas | **Não passou** — `text` veio vazio |
| 2. Cita relato de delivery/restaurante | **Não passou** — idem |
| 3. Não decide sozinha, expõe e deixa em aberto | **Não passou** — não há proposta nenhuma |
| 4. Usa números reais | **Não passou** — nada foi produzido |
| 5. Não inventa prazo de validade | **Passou, tecnicamente** — não inventou nada porque não disse nada |

**Justificativa consolidada:** o agente consultou as 5 tools certas (evidência de que o *processo* estava certo), mas não produziu texto nem proposta — falha em 4 dos 5 critérios, não por má decisão, mas por ausência de decisão. É exatamente o tipo de falha que só aparece testando de ponta a ponta, não lendo o prompt.

---

*Gerado durante ensaio de gravação, branch `ensaio-aula4`. Cenário 100% real — nenhum dado inventado.*
