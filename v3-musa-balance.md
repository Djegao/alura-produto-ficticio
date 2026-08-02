# v3-musa-balance: Resumo de Contexto e Especificação do Produto

**Documento de Alinhamento e Handover para Desenvolvimento**  
**Projeto:** Chef Caseiro v3 ("Musa Balance")  
**Propósito:** Resumo executivo do pivot do produto, princípios de engenharia e diretrizes pedagógicas para o curso Alura (*Evals, observabilidade e conformidade*).

---

## 1. Visão Geral e o Pivot de v1 para v3

### 1.1 A Crítica Honesta à v1
A versão 1 do *Chef Caseiro* cumpriu o papel de validar o fluxo agêntico básico, mas provou ser conceitualmente rasa: tratava-se de um gestor de estoque com um chat genérico acoplado. Faltava-lhe o conflito real, a imprevisibilidade do uso contínuo e a complexidade das relações de tomada de decisão do mundo real.

### 1.2 O Problema Real ("Musa Balance")
O produto v3 nasce para resolver a gestão de alimentação, nutrição, finanças e desejos dentro de uma casa real, integrando duas personas principais com incentivos e perfis distintos:

*   **Diego (Chef Ops & Sustentabilidade):** Cozinheiro majoritário. Busca otimizar o preparo em lote no fim de semana (*batch cooking*), gerenciar a depreciação de alimentos frescos vs. branqueados (regra D-6), minimizar o desperdício (sustentabilidade/orçamento) e evitar a "escala de derrota" do *delivery* (sendo o McDonald's o nível máximo de falha operacional).
*   **A Esposa ("Musa"):** O cliente mais importante do ecossistema. Traz o desejo, a recompensa da semana, a experiência sensorial e a motivação gastronômica (ex.: o desejo de uma lasanha artesanal perfeitamente planejada e executada para o fim de semana).

### 1.3 A Missão do Produto
A IA atua como **mediadora e simuladora de impacto**, e **não como uma juíza punitiva**. O objetivo não é proibir indulgências (hambúrgueres, jantares fora com amigos), mas sim expor o peso e as consequências de cada escolha antes de a decisão ser tomada, equilibrando o orçamento, macros nutricionais e prazos de validade do estoque.

---

## 2. Conceito da "Vitória Máxima" e Matriz de Trade-offs

*   **A Vitória Máxima:** Uma refeição *Premium* no fim de semana que gere integração de sabores ("melhor no dia seguinte") e cujas sobras garantam almoços equilibrados na segunda-feira, mantendo os slots nutritivos sustentáveis ao longo de toda a semana.
*   **Slots Flexíveis/Condicionais:** Almoços de trabalho na rua, jantares sociais ou hambúrguer na sexta-feira são permitidos e mapeados. O sistema calcula o impacto em tempo real:
    > *"Se optarmos pelo hambúrguer na sexta, o impacto orçamentário é de +R$ 45 e precisaremos compensar o déficit proteico no almoço de sábado."*
*   **Escala de Desvio/Derrota:** Monitoramento contínuo da taxa de desvio em direção a refeições não planejadas de baixa qualidade nutricional (*deliveries* ultraprocessados).

---

## 3. Arquitetura de Produto & Princípios de AI Ops

### 3.1 Interface Zero-Friction: Grupo no Telegram
*   **Multi-Ator Nativo:** Interface operada dentro de um **Grupo no Telegram** contendo Diego, a Esposa e o Bot de IA.
*   **Modalidades de Ingestão:** Áudios rápidos, mensagens de texto e fotos (refeições, notas fiscais ou *cards* de receitas).
*   **Contexto Identificado:** O bot reconhece quem está enviando a mensagem (`from_user_id`), identificando o tom, o papel e a intenção individual.

### 3.2 Separação Cobre/Ouro: Determinístico vs. Probabilístico
Uma das diretrizes centrais de engenharia que servirá como **conteúdo no curso da Alura**:

*   **Camada Determinística (Supabase / Código):**
    *   Cálculo de depreciação de estoque (Ingredientes Frescos vs. Branqueados em D-6).
    *   Tabelas nutricionais, orçamento financeiro e histórico bruto de consumo.
    *   *Regra de Ouro:* A LLM **nunca** calcula prazos ou matemática financeira diretamente para evitar alucinações.
*   **Camada Probabilística (LLM / Claude):**
    *   Interpretação de linguagem natural (texto/áudio).
    *   Mediação empática do conflito de desejos vs. restrições.
    *   Geração de "Matches" de cardápio e sugestões persuasivas.

### 3.3 Agentes Especializados (Arquitetura Agêntica)
Para evitar o colapso de instrução (*Lost in the Middle* / Super Prompts):
1.  **Agente de Ingestão & Transcrição:** Recebe mensagens/áudios e extrai dados estruturados.
2.  **Agente de Estoque & Validade:** Monitora urgências no Supabase.
3.  **Agente Matchmaker/Mediador:** Lê o estado do banco e os desejos do casal para propor os *Matches* de refeição.

---

## 4. Memória de Longo Prazo (LTM) e Escala do Produto

### 4.1 Aprendizado Contínuo
O sistema aprende o paladar e hábitos do casal via **Memória de Longo Prazo (LTM)** armazenada de forma estruturada no Supabase:
*   Extração automática de preferências e aversões dinâmicas.
*   Injeção dinâmica (*Dynamic Few-Shot*) dos últimos *Matches* de sucesso no contexto da decisão.

### 4.2 Desafios de Escala e Conteúdo para o Curso (Alura)
Esta estrutura viabiliza discussões avançadas de AI Ops no curso:
*   **Memory Drift (Contradição de Memória):** Aplicação de fatores de expiração (*TTL / Decay factor*) para preferências antigas vs. recentes.
*   **Compressão de Contexto:** Agentes assíncronos em background que sintetizam o histórico semanal para evitar explosão de custo de tokens.
*   **Multi-Tenancy & Segurança:** Isolamento estrito de dados familiares via *Row-Level Security (RLS)* no Supabase.

---

## 5. Integração com as Aulas do Curso Alura

| Aula / Módulo | Aplicação Prática da v3 no Conteúdo |
| :--- | :--- |
| **Aula 1: AI Ops & Riscos** | Apresentação da transição do Discovery de IA para o "Dia 2" (operação real multi-ator). |
| **Aula 2: Evals & LLM-as-a-Judge** | Avaliação da qualidade da mediação da IA (Claude julga se a sugestão respeitou o desejo da esposa E a restrição de estoque). |
| **Aula 3: Observabilidade (Langfuse)** | Leitura de *Traces* multi-usuário no Telegram (áudio Whisper + chamadas do Claude + escritas no Supabase). |
| **Aula 4: Diagnóstico & Correção** | Contraste de *Prompting* vs. *tool_choice* forçado; identificação de gargalos de latência e teto de tokens. |
| **Aula 5: Guardrails & Conformidade** | Governança de memórias familiares (LGPD), filtros de custo e políticas de retenção de logs. |

---

## 6. Próximos Passos de Desenvolvimento para o Claude / Engenharia

1.  **Bot Telegram:** Configurar webhook com identificação de `user_id` e suporte a texto/áudio.
2.  **Schema Supabase:** Implementar as tabelas do *Musa Balance* (estoque com validade D-6, preferências, diário de refeições e pontuação).
3.  **Prompt Mediador:** Desenvolver o prompt do Agente Matchmaker focado no balanço de trade-offs.
4.  **Instrumentação Langfuse:** Garantir que todas as chamadas no Telegram gerem *spans* aninhados e visíveis no dashboard.