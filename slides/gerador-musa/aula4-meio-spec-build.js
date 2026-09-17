// Gera aula4-meio-spec.json: o meio novo da Aula 4 (Episodio D, ciclo
// completo), 4.2.1 a 4.2.6 + 4.5. Decisoes batidas em 17/09 (tarde):
// D1 = A (soma 2+2 nao mexe, conta em camera), D2 = episodio 3 fundido com
// o cap. 4.4.1, D3 = sopa de abobora disparada antes de gravar.
//
// Fontes: docs/aula4-concierge-debate-e-fechamento.md,
// docs/aula4-sdd-pre-manufaturado-episodio-d.md,
// docs/aula4-concierge-codigo-episodio-d.md,
// docs/aula4-concierge-evals-episodio-d.md,
// docs/apoio/evidencia-porcionamento-patinho.md.
//
// Cada item tem um `layout` (ver gerar-aula4-meio.ps1). Pedido do Diego em
// 17/09: variar o tipo de slide (o 4.2 antigo era so circulo trocando titulo)
// e centralizar titulos H e V. Imagem nova = placeholder, ele aplica no ensaio.
//
//   node aula4-meio-spec-build.js
const fs = require('fs');
const path = require('path');

const S = [];
const add = (video, o) => S.push({ video, n: S.length + 1, ...o });

// ------------------------------------------------------------ 4.2.1 ------
add('4.2.1', { layout: 'divisor', title: '4.2.1 O hambúrguer que sumiu',
  notes: 'Recap do diagnóstico. Na aula passada eu mostrei o achado; agora ele vira o fio de um ciclo inteiro: decidir, corrigir e provar.' });

add('4.2.1', { layout: 'conversa', title: '14/09, 18h17. Quatro mensagens.',
  msgs: [
    { who: 'diego', text: 'O que vamos comer na sexta?' },
    { who: 'diego', text: 'Preparei hambúrguer de patinho, 220g pra mim e 160g pra esposa. Tá pronto no congelador, dois de cada.' },
    { who: 'bot', text: 'Quantas porções rendeu a hambúrguer de patinho?' },
    { who: 'diego', text: 'Porcionei em 2 unidades de 220g e 2 unidades de 160g' },
    { who: 'bot', text: 'Porcionou o quê, e em quantas porções?' },
    { who: 'diego', text: 'O hambúrguer de patinho' },
  ],
  caption: 'Fim da conversa: uma reação 🤔. O prato nunca entrou no estoque.',
  notes: 'Essa é a conversa real, no Telegram, 14 de setembro. Eu cozinhei, contei pro produto, ele perguntou quantas porções — do jeito que eu mesmo desenhei, nunca chutar. Eu respondi. Ele perguntou de novo, mais genérico. Eu respondi de novo. E acabou num emoji.\n\nNada deu erro. Nenhum log, nenhum alarme. O hambúrguer simplesmente não existe no sistema.' });

add('4.2.1', { layout: 'tabela', title: 'Cada mensagem, classificada certo',
  sub: 'Os quatro traces reais no Langfuse, 14/09',
  header: ['#', 'Mensagem', 'O modelo entendeu', 'O que ficou gravado'],
  colW: [70, 610, 470, 450],
  rows: [
    ['1', '“O que vamos comer na sexta?”', 'desejo', 'nada'],
    ['2', '“Preparei hambúrguer de patinho…”', 'porcionamento, sem número', 'nada (só a pergunta)'],
    ['3', '“Porcionei em 2 unidades de 220g…”', 'porcionamento, sem prato', 'nada (outra pergunta)'],
    ['4', '“O hambúrguer de patinho”', 'desejo', 'nada'],
  ],
  notes: 'Olhando trace por trace: a classificação está certa nas quatro. A mensagem 2 não tinha número, então perguntou. A mensagem 3 não repetia o nome do prato — e o classificador só recebe a mensagem atual, começa do zero. A 4, sem contexto, parece um desejo.\n\nA última coluna é o problema: nada ficou gravado em nenhuma das quatro. Nem a pergunta.' });

add('4.2.1', { layout: 'cards3', bg: 'claro', title: 'Prompt, dados ou modelo?',
  sub: 'Nenhum dos três. A causa é o produto em volta do modelo.',
  cards: [
    { tag: 'PROMPT', head: 'Correto', body: 'Pediu exatamente o que devia, nas quatro chamadas.' },
    { tag: 'DADOS', head: 'Corretos', body: 'O texto que chegou era claro. Uma pessoa entenderia.' },
    { tag: 'MODELO', head: 'Acertou 4 de 4', body: 'Nenhuma classificação errada na sequência inteira.' },
  ],
  notes: 'O framework de diagnóstico que a gente usou nos outros episódios não fecha aqui. Não é prompt, não é dado, não é modelo. É uma quarta categoria: arquitetura. A pergunta foi feita e ninguém guardou que ela foi feita.\n\nPonte: eu já sei o que quebrou. Antes de abrir código, eu preciso decidir o caminho.' });

// ------------------------------------------------------------ 4.2.2 ------
add('4.2.2', { layout: 'divisor', title: '4.2.2 Qual caminho, antes do código',
  notes: 'D3 aplicada: antes de gravar este vídeo, a mensagem "Preparei sopa de abóbora" já foi mandada no grupo, sem resposta. Ela vai expirar sozinha até o 4.2.5.' });

add('4.2.2', { layout: 'cards3', bg: 'escuro', title: 'Três caminhos no backlog',
  cards: [
    { tag: 'P1', head: 'Guardar a pergunta', body: 'Mesmo padrão do orçamento: persistir a pendência, só pro porcionamento.', foot: 'esforço baixo · risco baixo' },
    { tag: 'P2', head: 'Generalizar P1', body: 'Qualquer guardrail que pergunta passa a guardar a pendência.', foot: 'esforço médio · sem 2º caso real' },
    { tag: 'P3', head: 'Memória de conversa', body: 'O classificador recebe as últimas N mensagens.', foot: 'esforço médio · risco alto' },
  ],
  notes: 'Eu já tenho um backlog pra esse episódio, com três caminhos. Eu tenho opinião sobre qual é o certo — mas eu não quero que o Claude só concorde comigo. Vou dar o código real e perguntar qual deles resolve o caso de verdade sem criar um problema maior.\n\n(P4 fica de fora da tabela de propósito: em qualquer caminho, eu preciso de um jeito de provar.)' });

add('4.2.2', { layout: 'imagem', title: 'O que eu levo\npro Claude',
  bullets: [
    'O código real: intencao-efeitos.js e telegram.js.',
    'A regra de ouro: a LLM não decide o que é verificável.',
    'A pergunta que importa: quanto custa o P3 de verdade?',
  ],
  placeholder: 'IMAGEM — pessoa conversando com IA / chat na tela',
  notes: 'AÇÃO: tela cheia no chat do Claude, colar o prompt de docs/aula4-concierge-debate-e-fechamento.md §2.1, anexando intencao-efeitos.js e telegram.js. Deixar terminar e ler em voz alta a parte sobre P3.\n\nRAMIFICAÇÃO A (recomenda P1): Bateu com o backlog. Mas repara no motivo que importa pra mim: P3 parece a solução "inteligente", só que ela devolve pro modelo uma decisão que hoje é do código — o que é resposta a quê. Aí cada conversa longa vira uma chance nova de o modelo ligar a resposta no prato errado, e isso não aparece em lugar nenhum.\n\nRAMIFICAÇÃO B (recomenda P2 ou P3): Olha que interessante: ele foi pro caminho mais geral. Não está errado em tese — mas eu tenho um caso real, um só. Generalizar sem um segundo caso é especular. E memória de conversa tira do código uma decisão que hoje é verificável. Eu fico com P1 e anoto o resto.\n\nNão corrigir o Claude no ar.' });

add('4.2.2', { layout: 'circulo', title: 'Perguntar não basta. Precisa lembrar que perguntou.',
  notes: 'Essa é a frase do P1. O guardrail de perguntar em vez de chutar estava certo. O que faltava era guardar a pergunta num lugar que a próxima mensagem consulta antes de classificar do zero.' });

add('4.2.2', { layout: 'ramos', title: 'E se ninguém responder?',
  raiz: 'Pergunta guardada',
  ramos: [
    { tipo: 'ok', head: 'Resolve', body: 'A resposta chega e o prato entra no estoque.' },
    { tipo: 'alerta', head: 'Expira, com aviso', body: '“Ingestão não concluída por falta de porções.”' },
  ],
  nota: 'Sem um fim visível, é o bug de 14/09 de novo, um passo depois.',
  notes: 'Só que P1, do jeito que está escrito, tem um furo. Ele guarda a pergunta pendente. E se ninguém nunca responder? A pendência fica lá, aberta, pra sempre — e ninguém fica sabendo que o prato não entrou. É o mesmo bug de 14/09, só que um passo depois: silêncio de novo.\n\nEntão a pendência precisa de um fim que alguém veja. Ou resolve, ou expira com um aviso claro. Não é bonito, mas é visível. E visível é o requisito.\n\nPonte: agora sim eu tenho um caminho. Antes de pedir código, quatro decisões pequenas — e uma delas eu ainda não fechei direito.' });

// ------------------------------------------------------------ 4.2.3 ------
add('4.2.3', { layout: 'divisor', title: '4.2.3 A SDD e quatro decisões',
  notes: 'Este vídeo é o antigo capítulo 4.4.1 (D2: fundidos).' });

add('4.2.3', { layout: 'citacao', title: 'SDD §11.7 — restrição derivada',
  quote: 'Toda pergunta de guardrail precisa guardar a pendência antes de perguntar. E toda pendência precisa de um fim visível: resolvida ou expirada com aviso.',
  fonte: 'Nunca “esquecida sem sinal”.',
  notes: 'TELA: docs/aula4-sdd-pre-manufaturado-episodio-d.md aberto no editor.\n\nEsse é o rascunho da seção 11.7 da SDD do produto. Observação, diagnóstico, restrição derivada, onde mexer — o mesmo formato dos outros achados. A restrição tem duas partes: guardar a pergunta, e garantir que ela termina em algo que alguém vê.' });

// Animacao forcada comeca no frame 0: as quatro lacunas vazias, depois uma
// resposta por frame (a resposta cobre a lacuna, mesma posicao).
add('4.2.3', { layout: 'decisoes', title: 'Quatro decisões, uma casa', buildInicio: 0,
  rows: [
    { q: 'Nome do status', a: 'aguardando_porcoes', mono: true },
    { q: 'Onde guardar o prato', a: 'coluna nova item_pendente', mono: true },
    { q: 'Janela de expiração', a: '20 minutos — em aberto', destaque: true },
    { q: 'Escopo do fix', a: 'só porcionamento, por enquanto' },
  ],
  notes: 'Antes de escrever uma linha de código, quatro decisões pequenas que fazem diferença depois. Vou decidir as quatro agora, em voz alta, e registrar na SDD.\n\nAÇÃO: editar o bloco "Pontos pra debater ao vivo" da SDD pré-manufaturada, fechando as quatro em texto corrido. Uma resposta entra por frame.\n\n1. aguardando_porcoes: simetria com aguardando_categoria, que já existe.\n2. Coluna nova item_pendente, não reusar descricao: mais explícito pro eval consultar depois.\n3. Janela: 20 minutos — decisão, mas com o debate aberto (próximo slide).\n4. Só porcionamento. Generalizar pra qualquer guardrail fica pra quando houver um segundo caso real.' });

add('4.2.3', { layout: 'regua', title: '20 minutos é uma aposta',
  marcas: [
    { v: '10 min', label: 'primeira versão' },
    { v: '20 min', label: 'hoje', destaque: true },
    { v: '120 min', label: 'cheguei a considerar' },
  ],
  esquerda: 'Curta demais: frustra quem demora pra responder.',
  direita: 'Longa demais: dois pratos pendentes, a porção cai no prato errado. Em silêncio.',
  notes: 'LEMBRETE (não é fala literal): o debate aconteceu em 17/09. Janela longa não custa API — o job não chama LLM — e frustra menos quem demora. O que segurou foi o risco de criar problema novo: o mesmo ator acumula mais de um prato pendente e o número cai no prato errado, em silêncio. Não é risco de confundir pessoas (filtro por actor_id).\n\nFALA: Coloquei 20 minutos. Cheguei a pensar em duas horas — não custa nada a mais — mas aí eu abro espaço pra um bug novo: eu cozinho dois pratos, não respondo nenhum, e a próxima resposta vai pro prato errado sem ninguém perceber. Essa régua não está fechada; é uma aposta que o dado de uso vai confirmar ou derrubar.' });

// ------------------------------------------------------------ 4.2.4 ------
add('4.2.4', { layout: 'divisor', title: '4.2.4 O que subiu',
  notes: 'Esse código eu subi antes de gravar. Vou mostrar a migração, o diff e o deploy reais — e testar ao vivo, contra produção, no próximo vídeo.' });

add('4.2.4', { layout: 'codigo', title: 'Uma coluna, uma restrição',
  sub: 'Migração Fase 7 — SQL Editor do Supabase, produção',
  code: [
    'alter table pensamentos',
    '  add column if not exists item_pendente text;',
    '',
    'alter table pensamentos add constraint pensamentos_status_check',
    "  check (status in ('completo', 'aguardando_categoria',",
    "                    'aguardando_porcoes', 'expirada'));",
  ],
  notes: 'Essa é a única parte que eu não pedi pro Claude escrever — é schema, é barato, e é convenção deste projeto rodar migração manual no SQL Editor, documentada depois no schema.sql.\n\nReparem que já entra um terceiro status, expirada — não é só pendente ou resolvida. Uma pendência que nunca resolve precisa de um destino final que alguém vê.' });

add('4.2.4', { layout: 'padrao', title: 'O padrão já existia',
  de: { head: 'aguardando_categoria', sub: 'orçamento — já em produção' },
  para: { head: 'aguardando_porcoes', sub: 'porcionamento — novo, mesmo molde' },
  passos: ['pergunta', 'guarda a pendência', 'a resposta resolve'],
  notes: 'TELA: diff de intencao-efeitos.js.\n\nO fluxo de orçamento já resolve exatamente este problema pra outro caso — pergunta, guarda a pendência, a resposta seguinte resolve. O pedido pro Claude foi aplicar a mesma forma no porcionamento, com as quatro decisões explícitas.\n\nRepara que a mudança inteira mora dentro de uma função que já existia — não precisou de arquitetura nova, só um pedaço de estado que faltava.' });

add('4.2.4', { layout: 'contraste', title: 'Persistir não basta. Precisa de um fim.',
  esq: { tipo: 'ok', tag: 'RESOLVIDA', head: 'status = completo', body: 'A resposta chegou dentro da janela. O prato entrou no estoque.' },
  dir: { tipo: 'alerta', tag: 'ESQUECIDA', head: 'status = expirada', body: 'Um job, a cada 2 minutos, fecha e avisa o grupo: “Ingestão não concluída por falta de porções: X.”' },
  notes: 'TELA: expiracao-porcionamento.js, ao lado de lembrete.js.\n\nO produto já tem um job que cobra relato — lembrete.js, de hora em hora. A pendência precisa da mesma ideia, só que rápida: minutos, não horas, porque a conversa real se resolve ou morre em minutos.\n\nA frase do aviso é literal de propósito — vira o padrão de UX pra qualquer guardrail futuro que expirar. Antes eu só fazia a pendência existir; agora ela sempre termina em algo que alguém vê.' });

add('4.2.4', { layout: 'imagem', title: 'Fechado,\nnão só narrado',
  bullets: [
    'Migração rodada e verificada no Supabase.',
    'Deploy real no Railway, não simulado.',
    'PR com a SDD §11.7 junto do código.',
  ],
  placeholder: 'IMAGEM — print do PR real no GitHub',
  notes: 'TELA: terminal (git log da branch aula4/fix-episodio-d-porcionamento) e o PR real.\n\nAqui é onde este episódio se separa da 2.5: lá o PR era simulado. Aqui teve push, deploy no Railway, e esse código vale pra minha casa de verdade. Título, corpo, diff, merge — o mesmo destino de qualquer mudança de produto.' });

// ------------------------------------------------------------ 4.2.5 ------
add('4.2.5', { layout: 'divisor', title: '4.2.5 Smoke test contra produção',
  notes: 'Isso aqui não é o teste formal — o teste formal com Score é o próximo vídeo. É só: o código está no ar e faz as duas coisas que eu descrevi.' });

add('4.2.5', { layout: 'caminhos', title: 'Dois caminhos, ao vivo',
  cols: [
    { tipo: 'ok', head: 'Frango desfiado', passos: ['“Preparei frango desfiado, 300g”', 'bot pergunta quantas porções', '“Porcionei em 3 unidades”'], resultado: 'Resolvido, citando o prato' },
    { tipo: 'alerta', head: 'Sopa de abóbora', passos: ['“Preparei sopa de abóbora”', 'bot pergunta quantas porções', 'ninguém responde'], resultado: 'Aviso de expiração no grupo' },
  ],
  notes: 'AÇÃO 1 (ao vivo): "Preparei frango desfiado, 300g" → esperar a pergunta → "Porcionei em 3 unidades" (sem repetir o prato, número único — nunca "dois de cada"). Confirmar que a resposta do bot menciona frango desfiado.\n\nAÇÃO 2: mostrar no grupo o aviso da sopa, já expirado.\n\nFALA: Mandei essa antes de começar, de propósito, pra não fazer vocês esperarem vinte minutos.\n\nSE o bot não reconhecer a continuação ou não houver aviso: parar aqui, não seguir pro eval fingindo que funcionou.' });

add('4.2.5', { layout: 'conversa', title: 'O teste feliz passa. A conversa real ainda não.',
  msgs: [
    { who: 'diego', text: 'Porcionei em 2 unidades de 220g e 2 unidades de 160g' },
    { who: 'bot', text: 'Ainda falta o total de porções de hambúrguer de patinho. Me manda só “porcionei em N”, com o número total.' },
  ],
  caption: '2 + 2 é conta. Conta é do código, não do modelo.',
  notes: 'D1 = A, contado em câmera.\n\nA mensagem real daquele dia não traz número nenhum. Chegar a 4 é somar, e a regra de ouro proíbe o modelo de fazer conta. O que o fix faz: pergunta de novo, já citando o prato — a referência não se perde mais, e a pendência continua viva. Melhor que silêncio. Mas o Diego de 14/09 ainda teria que mandar "porcionei em 4".\n\nFica no backlog: o modelo separa as parcelas, o código soma. É a segunda volta, não esta.' });

// ------------------------------------------------------------ 4.2.6 ------
add('4.2.6', { layout: 'divisor', title: '4.2.6 Um eval que olha o ciclo',
  notes: 'SETUP (off): backfill da linha de 14/09 feito; nome do prato do "depois" anotado (frango desfiado); chat do Claude, evals/criterios.md e terminal abertos.' });

add('4.2.6', { layout: 'circulo', title: 'O ciclo só se prova entre mensagens.',
  notes: 'A Aula 2.5 criou um eval do zero pra uma operação que nunca tinha eval. Hoje é diferente: ingerir-relato já tem três critérios. Só que nenhum pega o Episódio D, porque todos julgam um trace por vez — e a falha do hambúrguer só existe entre quatro traces.\n\nAÇÃO: colar o prompt do passo 5.1 (docs/aula4-concierge-evals-episodio-d.md).\n\nRAMIFICAÇÃO A (juiz decidindo qualidade): se resolveu ou não é fato, banco de dados — não entra pro juiz. Qualidade da pergunta é outro critério.\nRAMIFICAÇÃO B (binário, cálculo em código): Isso. Ele já separou o que é fato do que seria opinião.' });

add('4.2.6', { layout: 'timeline', title: 'Cada trace, sozinho, está perfeito',
  traces: [
    { n: '1', txt: 'desejo' },
    { n: '2', txt: 'porcionamento' },
    { n: '3', txt: 'porcionamento' },
    { n: '4', txt: 'desejo' },
  ],
  chave: { de: 1, ate: 2, label: 'a falha só existe no par 2 → 3' },
  notes: 'Antes de fechar o critério, bato contra o que aconteceu em produção: 14 de setembro, quatro mensagens, 18h17 às 18h18, cada classificação correta. A mensagem 2 cria a pendência. A 3 tenta responder sem repetir o prato. A 4 nem é reconhecida como resposta.\n\nPor isso este eval não pode ser "olhe o trace 3 e julgue" — o trace 3, isolado, está perfeito. O problema só existe quando você olha o par 2→3 junto.' });

add('4.2.6', { layout: 'criterio', title: 'ciclo_pergunta_resposta_resolvido',
  sub: 'O juiz só lê o status. Quem decidiu foi o produto.',
  saidas: [
    { cond: 'sem pendência ou completo', val: '1', tipo: 'ok' },
    { cond: 'expirada', val: '0', tipo: 'erro' },
    { cond: 'ainda aguardando_porcoes', val: 'pula', tipo: 'neutro' },
  ],
  notes: 'AÇÃO: colar o bloco do passo 5.3 em evals/criterios.md; depois pedir o script (passo 5.4), no molde de run-eval-receita-premium.js.\n\nO documento final não é a primeira resposta — é a proposta menos o que já é código, mais o que os quatro traces reais mostraram.\n\nExpirada vale 0 mesmo com aviso: avisar que falhou não é o mesmo que o prato estar no estoque.\n\nRepara: ele não inventou estrutura nova, reaproveitou a forma da 2.5. E fica mais simples, porque nem o eval decide o que é "resolvido" — o produto já decidiu.' });

add('4.2.6', { layout: 'numeros', title: 'Mesmo critério. Antes e depois.',
  paineis: [
    { quando: 'ANTES · 14/09', prato: 'hambúrguer de patinho', val: '0', tipo: 'erro', nota: 'linha inserida à mão, timestamp real' },
    { quando: 'DEPOIS · ao vivo', prato: 'frango desfiado', val: '1', tipo: 'ok', nota: 'resolvido pela resposta seguinte' },
    { quando: 'DEPOIS · sem resposta', prato: 'sopa de abóbora', val: '0', tipo: 'erro', nota: 'o eval funcionando' },
  ],
  notes: 'AÇÃO: node evals/run-eval-ciclo-pergunta-resposta.js --limit 20 --dry-run\n\nANTES: Ali está o trace de 14 de setembro. Nota 0. Transparência: a linha que guarda essa pendência eu inseri à mão antes de gravar, com o timestamp real do incidente — em 14/09 o produto não persistia nada, esse era o bug. Não é dado fabricado, é o mesmo achado documentado entrando na estrutura que não existia na época.\n\nAÇÃO: node evals/run-eval-ciclo-pergunta-resposta.js --limit 5 --dry-run\n\nDEPOIS: Mesmo critério, mesmo script, trace novo — frango desfiado, resolvido, nota 1.\n\nSOPA: E a sopa de abóbora aparece com zero. Não é o eval errando: é exatamente o que ele tem que dizer. O produto avisou — mas a sopa não está no estoque.\n\nOpcional (5.6): rodar sem --dry-run pra gravar o Score real no Langfuse.' });

// ------------------------------------------------------------ 4.5 --------
add('4.5', { layout: 'divisor', title: '4.5 O que aprendemos',
  notes: 'Substitui o 4.5 antigo ("quatro falhas, nenhuma gritou"). A aula não termina mais em diagnóstico: termina num ciclo fechado com prova.' });

add('4.5', { layout: 'ciclo', title: 'O ciclo desta aula',
  passos: ['Observar', 'Diagnosticar', 'Decidir', 'Corrigir', 'Provar'],
  notes: 'Recapitulando o que a gente fez nesta aula. Eu não li código pra descobrir o problema: eu observei. Quatro mensagens, quatro classificações certas, e um prato que nunca existiu no sistema. O diagnóstico não era prompt, nem dado, nem modelo — era o produto em volta do modelo. Aí eu decidi o caminho, escrevi a restrição, subi o código, e criei um eval que enxerga o que nenhum dos três critérios anteriores enxergava: o ciclo, não a mensagem.' });

add('4.5', { layout: 'lista', title: 'Toda correção cria uma coisa nova pra observar',
  itens: [
    { head: 'Uma janela de 20 minutos', body: 'é aposta, não verdade. O dado de uso confirma ou derruba.' },
    { head: 'Um aviso de “não concluída”', body: 'é honesto, mas agora alguém precisa ler.' },
    { head: '“2 de 220 g e 2 de 160 g”', body: 'ainda não fecha sozinha. Somar é do código.' },
  ],
  notes: 'E agora o ponto que eu mais quero que fique. Essa correção não terminou o trabalho — ela trocou um problema invisível por três coisas visíveis. A janela de 20 minutos é uma aposta: se o dado mostrar muita pendência expirando, a régua estava errada. O aviso de ingestão não concluída é honesto, mas alguém precisa ler. E a mensagem real daquele dia ainda não resolve sozinha — somar é conta, e conta aqui é do código, não do modelo. O produto agora pergunta de novo, citando o prato. Melhor que silêncio. Não é o fim.' });

add('4.5', { layout: 'hero', title: 'Consertar não é o fim.', sub: 'É o começo do que observar.',
  meta: 'Próxima aula: guardrails, transparência e LGPD',
  notes: 'Consertar não é o fim — é o começo do que observar. E quando o produto passa a perguntar, a avisar e a decidir coisas pela casa, a pergunta seguinte é inevitável: o que ele pode fazer sozinho, o que ele precisa me contar, e o que ele não deveria nem guardar. Isso é a Aula 5: guardrails, transparência e LGPD — começando justamente pelo episódio que eu deixei de propósito sem corrigir, o da lasanha. Até lá.' });

fs.writeFileSync(path.join(__dirname, 'aula4-meio-spec.json'), JSON.stringify(S, null, 2), 'utf8');
console.log(`aula4-meio-spec.json: ${S.length} slides`);
