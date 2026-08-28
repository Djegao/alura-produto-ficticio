// Gera os 5 decks .pptx do curso Alura "Evals, observabilidade e
// conformidade" a partir dos outlines slide-a-slide dos roteiros
// (docs/aula1-roteiro.md ... aula5-roteiro.md) e, para a Aula 4 (sem
// roteiro numerado), do docs/RUNBOOK-gravacao-29-08.md +
// docs/aula4-roteiro-falha-telegram.md + docs/aula4-inventario-conteudo.md.
//
// O conteúdo de cada aula fica em arrays de dados (const aulaN = [...]) —
// separado da função que desenha o slide (renderDeck). Pra editar o texto
// de um slide, mexa só no array; o layout/paleta vem de ./tema-alura.js
// (que por sua vez reflete o estilo já aprovado em ../generate-slides.js,
// não alterado).
//
// Uso: node slides/generate-slides-curso.js

const path = require('path');
const { criarApresentacao, criarTema } = require('./tema-alura');

const CURSO = 'Evals, observabilidade e conformidade';

function renderDeck(nomeArquivo, footerLabel, slides) {
  const pres = criarApresentacao();
  const tema = criarTema(pres, footerLabel);

  for (const sl of slides) {
    switch (sl.type) {
      case 'cover':
        tema.addCover(sl.title, sl.subtitle, sl.meta);
        break;
      case 'divider':
        tema.addDivider(sl.number, sl.title);
        break;
      case 'bullets':
        tema.addBulletSlide(sl.eyebrow, sl.title, sl.bullets, sl.opts || {});
        break;
      case 'table':
        tema.addTableSlide(sl.eyebrow, sl.title, sl.header, sl.rows, sl.colW);
        break;
      case 'closing':
        tema.addClosing(sl.kicker, sl.text);
        break;
      default:
        throw new Error(`Tipo de slide desconhecido: ${sl.type}`);
    }
  }

  const outPath = path.join(__dirname, nomeArquivo);
  return pres.writeFile({ fileName: outPath }).then(() => {
    console.log(`  gerado: slides/${nomeArquivo} (${slides.length} slides)`);
  });
}

// ============================================================
// AULA 1 — O produto lançou. E agora?
// ============================================================

const aula1 = [
  {
    type: 'cover',
    title: 'O produto lançou.\nE agora?',
    subtitle: 'Aula 1 — os três pilares da operação',
    meta: 'Chef Caseiro em produção desde 27/07 — https://chef.workshopee.com.br',
  },

  { type: 'divider', number: '1.1', title: 'Apresentação' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.1',
    title: 'Antes de começar',
    bullets: [
      'Quem sou eu, o que já construí, por que estou ensinando isso agora.',
      'O que você vai conseguir fazer ao final: operar um produto com IA em produção, não só construir um.',
      { text: '"Lançar é fácil comparado com manter."', bold: true },
    ],
  },

  { type: 'divider', number: '1.2', title: 'Lançar é o começo' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.2',
    title: 'Deploy não é o fim',
    bullets: [
      'O erro mental mais comum: tratar "deploy" como linha de chegada.',
      'Com IA isso é pior que com software tradicional — o modelo muda de comportamento sem você mudar uma linha de código.',
      'Nova versão, novo contexto, novo usuário: tudo isso já é uma mudança de comportamento.',
      { text: 'O ciclo contínuo de operação começa exatamente aqui, no dia do deploy.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.2',
    title: 'Chef Caseiro em produção',
    bullets: [
      'Assistente que sugere o que cozinhar com base no estoque real da casa.',
      'Uso doméstico real — não é seed de demonstração.',
      'Dado real desde 27/07: pedidos, sugestões, consumo, preferências.',
      { text: 'E, mesmo assim, já tem um bug vivo esperando pra ser mostrado nas Aulas 3 e 4.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.2',
    title: 'O loop da operação',
    bullets: [
      'Evals → a resposta é boa?',
      'Observabilidade → o que está acontecendo em produção?',
      'Conformidade responsável → o produto respeita seus limites?',
      { text: '...e volta pro início. Não é uma lista — é um loop contínuo.', bold: true },
    ],
  },

  { type: 'divider', number: '1.3', title: 'Os três pilares da operação' },
  {
    type: 'table',
    eyebrow: 'Vídeo 1.3',
    title: 'Três pilares, três perguntas',
    header: ['Pilar', 'Pergunta-chave'],
    rows: [
      ['Evals', 'Como sei que a resposta é boa, sem revisar cada uma à mão?'],
      ['Observabilidade', 'Como enxergo o que está acontecendo em produção sem estar olhando o tempo todo?'],
      ['Conformidade responsável', 'Como garanto que o produto não ultrapassa limites que protegem usuário e empresa?'],
    ],
    colW: [3.0, 5.9],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.3',
    title: 'Como eles se conectam',
    bullets: [
      'Não são sequenciais na prática — eles se alimentam.',
      'Um eval mal feito não detecta a falha que a observabilidade só encontra depois.',
      'Uma falha de observabilidade sem guardrail vira incidente de conformidade.',
      { text: 'Os três formam um circuito, não uma lista de etapas.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.3',
    title: 'O que vem a seguir',
    bullets: [
      'Aula 2 — Evals: avaliando a qualidade das respostas.',
      'Aulas 3 e 4 — Observabilidade: monitorando, diagnosticando e corrigindo em produção.',
      'Aula 5 — Guardrails, transparência e LGPD.',
      { text: 'Sem entregar o conteúdo ainda — só o mapa.', bold: false },
    ],
  },

  { type: 'divider', number: '1.4', title: 'Mapeando riscos do produto' },
  {
    type: 'table',
    eyebrow: 'Vídeo 1.4',
    title: 'Mapa de riscos — Chef Caseiro',
    header: ['Risco', 'A pergunta (sem spoiler)'],
    rows: [
      ['1. Custo concentrado', 'O que acontece se o agente mais caro começar a rodar em loop, ou o preço do modelo mudar?'],
      ['2. Correspondência de dado', 'E se o que a pessoa disse não bater exatamente com o que está gravado no banco? O sistema avisa, ou fica quieto?'],
      ['3. Canal que não avisa', 'Bot recebe uma mensagem que não sabe processar — devolve erro, ou finge que nunca recebeu nada?'],
      ['4. Modelo fazendo conta', 'Por que é arriscado o modelo somar números em vez de um código fazer isso, mesmo quando a conta dá certo?'],
    ],
    colW: [2.6, 6.3],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.4 — risco 1',
    title: 'Custo concentrado num único agente',
    bullets: [
      'Um agente do produto é responsável por uma fração pequena das chamadas — e a maior fatia do custo.',
      'O que monitorar: custo médio por operação, não só volume de chamadas.',
      { text: 'A pergunta antes de escalar: "esse agente está caro porque é bom, ou porque está desperdiçando?"', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.4 — riscos 2 e 3',
    title: 'Silêncio como falha',
    bullets: [
      'Dado errado sem alarme: o sistema registra algo, mas o registro não bate com a realidade.',
      'Canal que não confirma nem nega: uma mensagem chega e nada acontece — nem erro, nem sucesso.',
      { text: '"Não aconteceu nada" é o sintoma mais difícil de notar — mais difícil que um erro visível.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.4 — risco 4',
    title: 'O modelo fazendo aritmética',
    bullets: [
      'É tentador deixar o modelo "só somar" um número no meio da resposta.',
      'A regra de ouro do projeto: matemática sempre em código, nunca pedida ao modelo.',
      { text: 'O que pode dar errado quando essa regra é quebrada por um caso de borda? É a pergunta que fica em aberto.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 1.4',
    title: 'Gancho de fechamento',
    bullets: [
      'Quantos desses quatro riscos esse produto já sofreu de verdade, em produção, essa semana?',
      { text: 'Vamos ver nas próximas aulas.', bold: true },
    ],
    opts: { quote: 'Esses quatro riscos vão aparecer de novo — com nome, número e trace — nas Aulas 3 e 4.' },
  },

  { type: 'divider', number: '1.5', title: 'O que aprendemos?' },
  {
    type: 'bullets',
    eyebrow: 'Fechamento da aula',
    title: 'O que aprendemos',
    bullets: [
      'Lançar é o começo de um ciclo, não o fim de um projeto.',
      'Os três pilares que sustentam esse ciclo: evals, observabilidade, conformidade responsável.',
      'Todo produto com IA em produção carrega riscos reais e mapeáveis.',
      { text: 'As próximas aulas mostram esses riscos acontecendo de verdade, com evidência real do Chef Caseiro.', bold: true },
    ],
  },

  {
    type: 'closing',
    kicker: 'AULA 1 CONCLUÍDA',
    text: 'Lançar é o começo.\nA operação começa agora.',
  },
];

// ============================================================
// AULA 2 — Evals: avaliando a qualidade das respostas
// ============================================================

const aula2 = [
  {
    type: 'cover',
    title: 'Evals: avaliando a\nqualidade das respostas',
    subtitle: 'Aula 2 — usando o Claude como avaliador sistemático',
    meta: 'Branch aula2/pipeline-evals — evals/run-evals.js + evals/criterios.md',
  },

  { type: 'divider', number: '2.1', title: 'O que são evals?' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.1',
    title: 'O que é um eval?',
    bullets: [
      'Teste automatizado — mas de qualidade de resposta, não de correção de código.',
      'Não existe "verde/vermelho" simples: existe critério.',
      'Roda continuamente, não só uma vez antes do deploy.',
      { text: 'O modelo, o prompt e os dados mudam — um eval que passou ontem pode falhar hoje sem nenhuma mudança de código sua.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.1',
    title: 'Por que não dá pra revisar à mão',
    bullets: [
      { text: 'O Chef Caseiro já gerou 68 traces em um mês de uso — de uma casa só.', bold: true },
      'Multiplique isso por usuários reais de um produto em escala.',
      'Testar uma vez antes do deploy ≠ avaliar continuamente depois do deploy, em produção real.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.1',
    title: 'Onde o eval entra no ciclo',
    bullets: [
      'Evals → Observabilidade → Conformidade — o mesmo loop da Aula 1.',
      'Evals é a primeira seta: responde "isso é bom?".',
      '"Isso está funcionando?" é a Aula 3. "Isso é seguro?" é a Aula 5.',
      { text: 'Evals não substitui observabilidade nem guardrails — é a primeira camada.', bold: true },
    ],
  },

  { type: 'divider', number: '2.2', title: 'Critérios de qualidade' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.2',
    title: 'O que faz um critério ser mensurável',
    bullets: [
      'Uma pergunta que qualquer pessoa da equipe conseguiria responder olhando a resposta — sem saber programar.',
      'Binária ou escalar, nunca vaga.',
      { text: 'Ligado a um requisito real do produto — nasce da spec, não da intuição.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.2',
    title: 'Critérios do Chef Caseiro',
    bullets: [
      'A sugestão usa só ingredientes que existem no estoque?',
      'A receita respeita as restrições da casa?',
      { text: 'O agente registrou o consumo depois de sugerir? (achado §11.3 do SDD, virou eval direto)', bold: true },
      'Cada critério aponta pra um requisito funcional do SDD (§7.3, §7.4) — não nasce do nada.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.2',
    title: 'Critério ruim → critério bom',
    bullets: [
      { text: 'Ruim: "a resposta é boa."', bold: false },
      'Vago demais — ninguém consegue julgar de forma consistente.',
      { text: 'Bom: "a resposta cita pelo menos 3 ingredientes do estoque atual."', bold: true },
      'Mensurável — qualquer pessoa da equipe chega ao mesmo veredito.',
    ],
  },

  { type: 'divider', number: '2.3', title: 'Claude como avaliador' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.3',
    title: 'Claude como juiz',
    bullets: [
      'Um segundo agente lê a interação: pedido + resposta + estado do estoque.',
      'Julga contra os critérios definidos na 2.2.',
      { text: 'O output do juiz vira Score, gravado de volta no Langfuse, ligado ao trace_id da interação original.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.3',
    title: 'Por que tool_choice forçado',
    bullets: [
      'Mesma lição do achado §11.3 do SDD: pedir "responda em JSON" no prompt não garante nada — forçar a tool garante.',
      'Já é convenção do projeto: agent.js (registrar_itens_usados), nota-fiscal.js (extração inteira).',
      { text: 'Reaplicada aqui pro juiz: se a saída não é estruturada de verdade, você não consegue agregar score nenhum depois.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.3',
    title: 'Do julgamento ao dado',
    bullets: [
      'Interação → Juiz (Claude + tool_choice) → Score → Langfuse (trace_id).',
      { text: 'Esse Score é o que a Aula 3 vai usar pra mostrar "qualidade ao longo do tempo".', bold: true },
    ],
  },

  { type: 'divider', number: '2.4', title: 'Primeiro conjunto de evals' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.4',
    title: 'Priorizando o que avaliar',
    bullets: [
      'Não avaliar tudo — priorizar pelos cenários que mais custam quando dão errado.',
      'Sugestão que usa item fora de estoque.',
      'Sugestão que ignora restrição alimentar.',
      'Consumo não registrado.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.4',
    title: 'Rodando contra dado real',
    bullets: [
      'O conjunto roda contra interações reais já logadas — não interações sintéticas criadas na hora.',
      { text: 'O valor do eval cai muito quando ele nunca viu dado real.', bold: true },
      'Comando: node evals/run-evals.js',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 2.4',
    title: 'O lag do Langfuse',
    bullets: [
      { text: '~45 segundos entre a exportação e o Score ficar consultável (achado §11.2 do SDD).', bold: true },
      'Isso é esperado, não é bug.',
      'Sem esse aviso, alguém vai achar que o Score sumiu ou que o script falhou.',
      'Muda a forma de automatizar em cima do Score — não dá pra checar em tempo real.',
    ],
  },

  { type: 'divider', number: '2.5', title: 'O que aprendemos?' },
  {
    type: 'bullets',
    eyebrow: 'Fechamento da aula',
    title: 'O que aprendemos',
    bullets: [
      'Eval é o critério que decide se uma resposta é boa, de forma repetível.',
      'Critério mensurável nasce do requisito real do produto, não de intuição.',
      'Claude-as-judge só é confiável com saída estruturada forçada — mesma regra do resto do projeto.',
      { text: 'O primeiro conjunto de evals prioriza cenários custosos, roda contra dado real, e escreve Score de volta no Langfuse.', bold: true },
    ],
  },

  {
    type: 'closing',
    kicker: 'AULA 2 CONCLUÍDA',
    text: 'Critério mensurável.\nJuiz com saída forçada.\nScore no trace.',
  },
];

// ============================================================
// AULA 3 — Observabilidade: monitorando em produção
// ============================================================

const aula3 = [
  {
    type: 'cover',
    title: 'Observabilidade:\nmonitorando em produção',
    subtitle: 'Aula 3 — lendo e interpretando dados reais com o Langfuse',
    meta: 'Dados reais: 68 traces, 27/07 → 22/08, US$ 1,65 acumulado',
  },

  { type: 'divider', number: '3.1', title: 'O que é observabilidade?' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.1',
    title: 'Log vs. observabilidade',
    bullets: [
      'Log é "o que aconteceu aqui" — um evento isolado.',
      { text: 'Observabilidade é "consigo reconstruir por que aconteceu", sem ter estado olhando na hora.', bold: true },
      'Cada um responde a uma pergunta diferente.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.1',
    title: 'A invariante do Chef Caseiro',
    bullets: [
      { text: 'SDD.md §8: nenhuma chamada ao Claude pode acontecer fora de uma observação do Langfuse.', bold: true },
      'Não é feature — é requisito não-funcional.',
      'instrumentation.js sobe o OpenTelemetry antes de qualquer outro módulo (primeiro require de server.js).',
      'Se isso não acontecer primeiro, chamadas feitas antes não são capturadas.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.1',
    title: 'O que quebra sem instrumentação',
    bullets: [
      'Sem as variáveis LANGFUSE_*, o SDK ainda funciona, ainda gera trace_id.',
      'Só não consegue exportar pro dashboard.',
      { text: 'Tirar a observabilidade não quebra o produto — quebra sua capacidade de saber o que ele está fazendo.', bold: true },
    ],
  },

  { type: 'divider', number: '3.2', title: 'Conhecendo o Langfuse' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.2',
    title: 'Trace, observation, generation',
    bullets: [
      'Trace = uma interação inteira.',
      'Observation = cada chamada dentro dela.',
      'generation pro Claude, span pra lógica, tool pra tool call.',
      { text: 'No Chef Caseiro, cada chamada e cada tool call viram observação própria, aninhada num span agent.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.2',
    title: 'Onde pegar as chaves',
    bullets: [
      'Langfuse Cloud (us.cloud.langfuse.com) → Settings → API Keys do projeto.',
      'LANGFUSE_SECRET_KEY / LANGFUSE_PUBLIC_KEY / LANGFUSE_BASE_URL.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.2',
    title: 'Antes / depois, ao vivo e local',
    bullets: [
      'Sem .env: o produto responde normalmente, mas nada aparece no Langfuse Cloud.',
      'Com .env: a mesma ação gera trace visível no Langfuse.',
      { text: 'Atenção ao lag de ~45s entre a chamada e o trace ficar consultável.', bold: true },
    ],
  },

  { type: 'divider', number: '3.3', title: 'Lendo os dados de produção' },
  {
    type: 'table',
    eyebrow: 'Vídeo 3.3 — dados reais',
    title: '68 traces, US$ 1,65 acumulado',
    header: ['Operação', 'n', 'Custo médio', 'Latência média', '% do custo'],
    rows: [
      ['mediar-cardapio', '10', 'US$ 0,1121', '45,4 s', '68 %'],
      ['sugerir-receita', '13', 'US$ 0,0227', '23,3 s', '18 %'],
      ['ingerir-relato', '30', 'US$ 0,0051', '2,6 s', '9 %'],
    ],
    colW: [2.4, 0.7, 1.8, 1.9, 2.1],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.3',
    title: '15% das chamadas, 68% da conta',
    bullets: [
      { text: 'O Mediador de cardápio não é o mais frequente — é o mais caro por chamada.', bold: true },
      '15% das chamadas do produto, mais de dois terços do custo total.',
      'Esse tipo de insight só aparece olhando dado agregado, não uma interação por vez.',
    ],
  },
  {
    type: 'table',
    eyebrow: 'Vídeo 3.3 — comparação de modelo',
    title: 'Mesmo agente, dois modelos',
    header: ['Modelo', 'n', 'Custo médio', 'Latência média'],
    rows: [
      ['claude-haiku-4-5', '6', 'US$ 0,00293', '1,17 s'],
      ['claude-sonnet-5', '24', 'US$ 0,00563', '2,99 s'],
    ],
    colW: [2.9, 0.9, 2.5, 2.6],
  },

  { type: 'divider', number: '3.4', title: 'Padrões de falha' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.4',
    title: '4 padrões de falha reais',
    bullets: [
      'Truncamento por max_tokens (SDD §11.4).',
      'Erro engolido por fallback defensivo — || [] escondendo falha de query (SDD §11.6).',
      'Episódios A e B do Telegram — dois modos de cegueira no canal.',
      'Episódio C — o modelo acertou, o código errou (falha de estado).',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.4',
    title: 'Truncamento por max_tokens',
    bullets: [
      'Assinatura reconhecível: output tokens == max_tokens configurado (1024).',
      'Resposta cortada no meio de uma palavra, na primeira observação.',
      { text: 'Desde 12/08, com despensa maior: o corte pode acontecer no meio de uma tool call, deixando um tool_use órfão.', bold: true },
      'Isso derruba a chamada seguinte com erro 400 da Anthropic. Não corrigido de propósito — reprodução ao vivo na Aula 4.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 3.4',
    title: 'O padrão comum',
    bullets: [
      { text: 'Nenhum dos quatro gritou sozinho.', bold: true },
      'Cada um precisou de alguém olhando o dado certo, na hora certa, com a pergunta certa.',
    ],
    opts: { quote: 'Detectar, diagnosticar e corrigir — é exatamente pra isso que serve a Aula 4.' },
  },

  { type: 'divider', number: '3.5', title: 'O que aprendemos?' },
  {
    type: 'bullets',
    eyebrow: 'Fechamento da aula',
    title: 'O que aprendemos',
    bullets: [
      'Observabilidade é reconstruir a causa, não só registrar o evento — no Chef Caseiro é invariante de código.',
      'Trace → observation → generation é a estrutura de dados do Langfuse.',
      { text: 'Dado real (68 traces, US$ 1,65) mostra onde o custo se concentra e onde trocar de modelo compensa.', bold: true },
      'Quatro padrões de falha documentados — nenhum gritou sozinho.',
    ],
  },

  {
    type: 'closing',
    kicker: 'AULA 3 CONCLUÍDA',
    text: 'Ver o dado não é\nabstrato — vira uma\nconta que fecha.',
  },
];

// ============================================================
// AULA 4 — Detectar, diagnosticar e corrigir
// (sem roteiro numerado — derivada do RUNBOOK-gravacao-29-08.md,
// aula4-roteiro-falha-telegram.md e aula4-inventario-conteudo.md)
// ============================================================

const aula4 = [
  {
    type: 'cover',
    title: 'Detectar, diagnosticar\ne corrigir',
    subtitle: 'Aula 4 — prompt, dados ou modelo? diagnóstico em produção real',
    meta: 'Deploy ao vivo — master → PR #4 → PR #6 — chef.workshopee.com.br',
  },

  { type: 'divider', number: '4.1', title: 'Detectando degradação' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.1',
    title: 'O estado em produção hoje',
    bullets: [
      'Produção está em master, com as falhas do Telegram preservadas de propósito.',
      'Dois PRs abertos, aguardando este vídeo: #4 (diagnóstico do Telegram) e #6 (nota por foto).',
      { text: 'A ordem importa: #4 antes do #6 — o #6 usa o avisar() que o #4 introduz.', bold: true },
    ],
  },
  {
    type: 'table',
    eyebrow: 'Vídeo 4.1 — dado real',
    title: 'Eixo de custo, por operação',
    header: ['Operação', 'n', 'Custo médio', 'Latência média', '% do custo'],
    rows: [
      ['mediar-cardapio', '10', 'US$ 0,1121', '45,4 s', '68 %'],
      ['sugerir-receita', '13', 'US$ 0,0227', '23,3 s', '18 %'],
      ['ingerir-relato', '30', 'US$ 0,0051', '2,6 s', '9 %'],
      ['ingerir-nota-fiscal', '4', 'US$ 0,0080', '3,9 s', '2 %'],
      ['receita-premium-semanal', '1', 'US$ 0,0157', '7,5 s', '1 %'],
    ],
    colW: [2.7, 0.6, 1.7, 1.9, 2.0],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.1',
    title: '15% das chamadas, 68% da conta',
    bullets: [
      { text: 'O Mediador de cardápio concentra o custo — não a frequência.', bold: true },
      'É o argumento mais concreto pra separar o eixo de geração do eixo de ingestão.',
      'Com o PR #6 entram três eixos trocáveis ao vivo: model, modelIngestao e modelVisao.',
    ],
  },

  { type: 'divider', number: '4.2', title: 'Diagnosticando a causa' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.2 — episódio A',
    title: 'O tratamento de erro apagou a evidência',
    bullets: [
      { text: 'Dois "fetch failed" no log, com 8 microssegundos de diferença.', bold: true },
      'Nenhuma chamada de rede real acontece nesse tempo.',
      'A segunda linha não é uma nova falha: é o próprio aviso de erro falhando dentro do catch, engolindo o erro original.',
      'O tratamento de erro apagou a evidência do próprio erro.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.2 — episódio B',
    title: 'A falha perfeitamente silenciosa',
    bullets: [
      'Foto do cupom enviada: nenhum log, nenhum trace, nenhuma escrita, nenhuma resposta.',
      { text: 'getWebhookInfo do Telegram confirma entrega — 0 pendentes, sem erros.', bold: true },
      'Por eliminação: um return mudo para mensagens sem .text (foto/áudio).',
      'Se o canal confirma a entrega e o sistema não registra nada, onde está a mensagem?',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.2 — episódio C',
    title: 'O modelo acertou, o código errou',
    bullets: [
      { text: '"Comemos 3 porções de lasagna, 1 e 1/2 para cada!" — classificado perfeitamente pelo agente.', bold: true },
      'item_nome: lasagna, quantidade: 3 (com a aritmética implícita já resolvida).',
      'E o estoque continuou 5/5 — o prato está gravado como lasanha; ilike \'%lasagna%\' não casa (gn × nh, não é acento).',
      'Preservado de propósito: é falha de estado, não de canal — só detectável cruzando trace com estado resultante.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.2',
    title: 'Prompt, dados ou modelo?',
    bullets: [
      'Episódios A e B: falha de canal — tratamento de erro e ausência de resposta.',
      'Episódio C: falha de estado — o prompt e o modelo estão impecáveis.',
      { text: 'A refutação direta do reflexo "o problema é o prompt": aqui quem errou foi a camada determinística.', bold: true },
    ],
  },

  { type: 'divider', number: '4.3', title: 'Corrigindo antes do usuário' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.3 — PR #4',
    title: 'O remendo honesto',
    bullets: [
      'detalharErro() desembrulha err.cause — "fetch failed" vira "fetch failed (causa: ENOTFOUND)".',
      'avisar() nunca derruba o fluxo — o envio do erro ganha try/catch próprio.',
      { text: 'O bot passa a dizer: "ainda não sei ler foto de cupom, me manda o link do QR ou o texto".', bold: true },
      'Admitir a limitação já é uma correção — o bug não era não saber ler, era não dizer.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.3 — PR #6',
    title: 'A capacidade nova: nota por foto',
    bullets: [
      'Ingestão de NFC-e pela URL do QR code — fetch da página pública da SEFAZ, HTML → texto.',
      'Cai no mesmo extrator LLM de nota-fiscal.js, estado-agnóstico de propósito.',
      { text: 'O desenho original (visão lê os 44 dígitos direto da foto) foi derrubado por teste — a SEFAZ-SP exige o hash que só existe dentro do QR.', bold: true },
    ],
  },

  { type: 'divider', number: '4.4', title: 'Simulando o ciclo completo' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.4',
    title: 'A consequência: taxa de erro sobe',
    bullets: [
      'Com foto entrando no fluxo, a superfície de erro aumenta.',
      { text: 'A tela de revisão de nota deixa de ser luxo — receipt_items.confirmed já existe no schema, hoje sempre true.', bold: true },
      'Gancho pro próximo PR de gaveta, combinado para ser construído depois do #6 testado.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 4.4',
    title: 'O que fica como risco aceito',
    bullets: [
      'Truncamento por max_tokens — não corrigido de propósito, reprodução ao vivo é o próprio conteúdo.',
      'Match aproximado de nome (episódio C) — não corrigir sem decidir; a saída provável é perguntar, não um algoritmo mais esperto.',
      { text: 'Risco aceito e documentado, não escondido — é o gancho direto pro checklist da Aula 5.', bold: true },
    ],
  },

  { type: 'divider', number: '4.5', title: 'O que aprendemos?' },
  {
    type: 'bullets',
    eyebrow: 'Fechamento da aula',
    title: 'O que aprendemos',
    bullets: [
      'Nem toda falha grita — os quatro episódios reais foram encontrados olhando dado, não esperando alarme.',
      'Admitir a limitação já é uma correção.',
      { text: 'Falha de canal (A, B) e falha de estado (C) exigem diagnóstico diferente — mas a mesma disciplina de observar.', bold: true },
      'Corrigir antes do usuário perceber é possível quando o dado de produção está visível.',
    ],
  },

  {
    type: 'closing',
    kicker: 'AULA 4 CONCLUÍDA',
    text: 'Nenhuma falha gritou\nsozinha. Todas foram\nencontradas olhando.',
  },
];

// ============================================================
// AULA 5 — Guardrails, transparência e LGPD
// ============================================================

const aula5 = [
  {
    type: 'cover',
    title: 'Guardrails,\ntransparência e LGPD',
    subtitle: 'Aula 5 — conformidade responsável em produtos com IA',
    meta: 'Tour de código, sem deploy — encerramento do curso',
  },

  { type: 'divider', number: '5.1', title: 'O que são guardrails?' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.1',
    title: 'O que é um guardrail',
    bullets: [
      'Limite operacional, não feature.',
      'Protege usuário e empresa.',
      { text: 'É código, não é intenção em prompt.', bold: true },
    ],
  },
  {
    type: 'table',
    eyebrow: 'Vídeo 5.1',
    title: 'Cinco guardrails reais do código',
    header: ['Guardrail', 'Onde'],
    rows: [
      ['tool_choice forçado pra saída estruturada crítica', 'agent.js, nota-fiscal.js, juiz da Aula 2'],
      ['Validação de domínio + formato antes de confiar em dado externo', 'sefaz.js — só .gov.br + chave de 44 dígitos'],
      ['"Perguntar em vez de chutar" como guardrail de produto', 'intencao-efeitos.js — porcionamento sem número vira pergunta'],
      ['Guarda-corpo de URL antes de publicar', 'receita-premium.js — confere contra o feed RSS antes de postar'],
      ['Basic Auth como guardrail de custo', 'APP_USER/APP_PASSWORD — SDD.md §8'],
    ],
    colW: [5.4, 3.5],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.1',
    title: 'O fio comum',
    bullets: [
      { text: 'Nenhum desses guardrails confia em pedir por linguagem natural quando a saída importa.', bold: true },
      'Reconecta com o achado §11.3, já visto nas Aulas 2 e 3: prompt pede, código garante.',
    ],
  },

  { type: 'divider', number: '5.2', title: 'Transparência com o usuário' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.2',
    title: 'Transparência não é aviso legal',
    bullets: [
      'Não é um texto de rodapé genérico.',
      { text: 'É o produto dizer, no momento certo, o que sabe fazer e o que não sabe.', bold: true },
      'Acontece no momento da limitação, não antes dela.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.2',
    title: 'O caso real: a foto do cupom',
    bullets: [
      { text: 'Antes do PR #4: uma foto de cupom não gerava resposta nenhuma — nem log, nem trace, nem mensagem.', bold: false },
      { text: 'Depois do fix: "ainda não sei ler foto de cupom, me manda o link do QR ou o texto".', bold: true },
      'O bug real não era "não saber ler foto" — sistemas têm limite. O bug era não dizer que não sabia.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.2',
    title: 'Admitir já é corrigir',
    bullets: [
      'Toda resposta "não sei fazer isso" é mais transparente — e mais barata de construir — que fingir que processou algo que não processou.',
    ],
    opts: { quote: 'Admitir a limitação já é uma correção — o bug não era não saber ler, era não dizer.' },
  },

  { type: 'divider', number: '5.3', title: 'LGPD na prática' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.3',
    title: 'Dado sensível não é só CPF',
    bullets: [
      'Rotina familiar, hábito de consumo, identidade em conversa privada — tudo isso é dado pessoal sob LGPD.',
      { text: 'O que comeram, o que desejam, quanto gastaram: dado de rotina, íntimo o suficiente pra merecer cuidado.', bold: true },
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.3',
    title: 'O que o Chef Caseiro coleta',
    bullets: [
      'telegram_chat_id e telegram_user_id — identificam pessoas reais, ligados a actors (chef/musa).',
      'pensamentos — o log cru de tudo que os dois atores conversam sobre comida em casa.',
      'Itens de estoque ligados à casa.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.3',
    title: 'Onde a proteção está — e onde não está',
    bullets: [
      { text: 'RLS desligado de propósito — decisão documentada (SDD.md §13.8), aceitável só no escopo de household único.', bold: false },
      'Proteção real: só SUPABASE_SERVICE_ROLE_KEY toca essas tabelas, nunca o browser.',
      'Basic Auth funciona como gate de acesso — não como controle de LGPD.',
      { text: 'Pergunta em aberto: quem tem direito de pedir exclusão desses dados, e o produto tem como atender hoje?', bold: true },
    ],
  },

  { type: 'divider', number: '5.4', title: 'Checklist de conformidade' },
  {
    type: 'table',
    eyebrow: 'Vídeo 5.4 — checklist, seção Guardrails',
    title: 'Como o Chef Caseiro está hoje',
    header: ['Item', 'Status'],
    rows: [
      ['Saída estruturada crítica não depende só de prompt', 'Sim'],
      ['Dado externo validado antes de confiar', 'Sim (SEFAZ)'],
      ['Pergunta em vez de estimar quando falta informação', 'Sim (porcionamento, lista de compras)'],
      ['Saída de IA que vira ação pública é conferida antes de publicar', 'Sim (receita premium)'],
      ['Acesso a recurso pago tem limite de custo', 'Parcial (Basic Auth, sem rate limit)'],
      ['Cálculo determinístico não é feito pela LLM', 'Quase sempre — 1 exceção documentada'],
    ],
    colW: [6.3, 2.6],
  },
  {
    type: 'table',
    eyebrow: 'Vídeo 5.4 — checklist, seção Transparência e LGPD',
    title: 'Como o Chef Caseiro está hoje',
    header: ['Item', 'Status'],
    rows: [
      ['Nenhum caminho termina em silêncio', 'Corrigido no Telegram (PR #4); não é garantia estrutural única'],
      ['O produto diz o que não sabe fazer', 'Sim, desde o PR #4'],
      ['Erros não são engolidos por tratamento defensivo', 'Corrigido caso a caso (convenção semSilencio)'],
      ['Falha silenciosa de estado é monitorada', 'Não — episódio C, preservado de propósito'],
      ['Controle de acesso a nível de linha (RLS)', 'Não — desligado de propósito, decisão documentada'],
      ['Política de retenção/exclusão de dado', 'Não existe'],
    ],
    colW: [6.3, 2.6],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.4',
    title: 'O que está em falta, sem rodeio',
    bullets: [
      'Falha silenciosa de estado não é monitorada — o episódio C fica sem correção, por decisão explícita.',
      'RLS desligado — aceitável só no escopo atual (household único), não num produto multi-tenant real.',
      'Sem política de retenção/exclusão de dado — reconhecido aqui pela primeira vez em documento formal.',
      { text: 'O checklist não é uma lista de "está tudo certo" — é "aqui estamos, aqui está o que falta".', bold: true },
    ],
  },

  { type: 'divider', number: '5.5', title: 'O que aprendemos?' },
  {
    type: 'bullets',
    eyebrow: 'Fechamento da aula',
    title: 'O que aprendemos',
    bullets: [
      'Guardrail é limite em código, não intenção em prompt.',
      'Transparência é o produto dizer, no momento certo, o que não sabe fazer — admitir já é corrigir.',
      'LGPD começa em identificar que dado de rotina também é dado pessoal.',
      { text: 'O checklist formaliza os três pontos como algo aplicável a qualquer produto, não só a este.', bold: true },
    ],
  },

  { type: 'divider', number: '5.6', title: 'Conclusão' },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.6',
    title: 'Os três pilares, com conteúdo real',
    bullets: [
      'Evals (Aula 2) — critério mensurável + Claude-as-judge com saída forçada, Score no Langfuse.',
      'Observabilidade (Aulas 3 e 4) — trace real, custo real, quatro padrões de falha detectados e corrigidos ao vivo.',
      'Conformidade responsável (Aula 5) — guardrail em código, transparência como comportamento, LGPD como prática.',
    ],
  },
  {
    type: 'bullets',
    eyebrow: 'Vídeo 5.6',
    title: 'O que o Chef Caseiro provou',
    bullets: [
      'Bug real corrigido ao vivo (Telegram, episódios A e B).',
      'Bug real preservado por decisão consciente (match de nome, episódio C).',
      { text: 'Custo real medido e comparado (haiku vs. sonnet).', bold: true },
      'Nenhum dos três pilares funciona sozinho.',
    ],
  },

  {
    type: 'closing',
    kicker: 'CURSO CONCLUÍDO',
    text: 'Lançar é o começo.\nEvals, observabilidade\ne conformidade sustentam\na operação.',
  },
];

// ---------- GERAÇÃO ----------

console.log(`Gerando decks do curso "${CURSO}"...`);

Promise.all([
  renderDeck('aula1.pptx', 'Aula 1 — O produto lançou. E agora? — ' + CURSO, aula1),
  renderDeck('aula2.pptx', 'Aula 2 — Evals: avaliando a qualidade das respostas — ' + CURSO, aula2),
  renderDeck('aula3.pptx', 'Aula 3 — Observabilidade: monitorando em produção — ' + CURSO, aula3),
  renderDeck('aula4.pptx', 'Aula 4 — Detectar, diagnosticar e corrigir — ' + CURSO, aula4),
  renderDeck('aula5.pptx', 'Aula 5 — Guardrails, transparência e LGPD — ' + CURSO, aula5),
])
  .then(() => {
    console.log('5 decks gerados com sucesso em slides/.');
  })
  .catch((err) => {
    console.error('Falha ao gerar os decks:', err);
    process.exit(1);
  });
