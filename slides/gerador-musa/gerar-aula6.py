# -*- coding: utf-8 -*-
r"""
Deck da Aula 6 — Conformidade (ex-Aula 5) do curso Alura 6498.

    python gerar-aula6.py
    powershell -NoProfile -ExecutionPolicy Bypass -File .\qa-aula6.ps1

Conteudo: docs/aula5-script.md (Slide · Script) + docs/aula5-roteiro.md.
Visual: copiado do "Aula 5.pptx" que o Diego montou a mao (bases divisor,
capa, statement, claro e escuro). Notas de apresentador quadro a quadro,
pra leitura corrida em gravacao.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from aula6_engine import (Deck, gera_referencia, AZUL, AZUL_MED, AZUL_CLA, VERDE, AMBAR,
                          VERMELHO, ROXO, TXT_FRACO, BG_CLARO, CARD_CLA,
                          BORDA_CLA, TXT_MEDIO, TXT_FORTE)
import aula6_layouts as L

AQUI = os.path.dirname(os.path.abspath(__file__))
ORIGEM = os.path.expanduser(r'~\Downloads\Aula 5.pptx')
DESTINO = os.path.join(AQUI, '..', 'Aula 6 6498 - conformidade.pptx')
MANIFESTO = os.path.join(AQUI, 'aula6-manifesto.json')

d = Deck(ORIGEM)

# =========================================================== 6.1 guardrails ==
L.divisor(d, '6.1 O que são guardrails?', [
    'Antes de gravar: nenhuma demo de terminal — é leitura de código. '
    'Ter abertos agent.js, sefaz.js, intencao-efeitos.js, receita-premium.js '
    'e server.js.'])

L.capa(d, 'Conformidade', [
    'Aula 6: conformidade. Guardrail em código, transparência como '
    'comportamento do produto e LGPD como prática. É a aula que fecha o '
    'curso — e a que responde a pergunta que sobrou das aulas 3 e 4: '
    'o que eu faço com o que eu vi.'])

L.statement(d, 'Guardrail é limite em código. Não é intenção em prompt.', [
    'Guardrail, nesta aula, tem uma definição específica: é um limite '
    'operacional que define o que o produto pode e não pode fazer — '
    'protegendo o usuário e protegendo a empresa. E a palavra-chave é '
    '"operacional". Não é uma frase no prompt pedindo comportamento. É '
    'código que impõe o limite, com ou sem a cooperação do modelo.'])

L.cards(d, 'claro', 'Guardrail é operacional', None, [
    dict(rotulo='Prompt', cor=AZUL, titulo='Linguagem natural = variabilidade',
         itens=['Regras no prompt não são determinísticas',
                'Contexto ambíguo → interpretações diferentes',
                'Caso real: o prompt v2 exigia chamar a ferramenta, e o '
                'modelo nem sempre chamou',
                'Não é "defeito": é o limite de instruir em linguagem natural']),
    dict(rotulo='Guardrail', cor=AZUL_MED, titulo='Do "confio" ao "garanto"',
         itens=['Prompt → comportamento esperado',
                'Guardrail → comportamento restringido',
                'tool_choice → chamada obrigatória',
                'Validação → regra executada pelo código',
                'Não dependo da interpretação do modelo']),
    dict(rotulo='Confere limites', cor=VERDE, titulo='Não é só sobre o usuário',
         itens=['Guardrails protegem usuário + empresa',
                'Evitam ação perigosa e comportamento inesperado',
                'Reduzem risco operacional, financeiro e de segurança',
                'Prompt não pode ser a última barreira']),
], [
    'Deixa eu explicar por que essa distinção importa tanto. Um prompt é uma '
    'instrução em linguagem natural, e o modelo interpreta linguagem natural '
    '— é literalmente o trabalho dele. Qualquer regra escrita só no prompt '
    'está sujeita à mesma variabilidade que qualquer outra interpretação. '
    'Lembra do achado da Aula 2? O prompt v2 pedia explicitamente pra chamar '
    'uma ferramenta antes de responder, e o modelo às vezes simplesmente não '
    'chamava. O prompt pedia. O modelo nem sempre obedecia.',
    'Guardrail é a resposta a esse problema. Em vez de pedir, eu construo uma '
    'trava que existe independente da interpretação: tool_choice forçado não '
    'é um pedido mais educado, é uma restrição na própria chamada de API. '
    'Validação de domínio não pergunta pro modelo se a URL parece confiável — '
    'o código decide antes do modelo entrar na jogada. É a diferença entre '
    '"eu confio que ele vai se comportar" e "eu construí de um jeito que ele '
    'não consegue se comportar mal, mesmo que tentasse".',
    'E isso vale pros dois lados. Protege o usuário — ele não recebe uma ação '
    'perigosa só porque o modelo teve um dia ruim. E protege a empresa: '
    'ninguém quer descobrir, num incidente de produção, que a única coisa '
    'entre uma chamada cara e a internet inteira era uma frase de prompt '
    'pedindo "por favor, só processe requisições autorizadas".'])

L.linhas(d, 'escuro', 'Os guardrails do produto atual', None, [
    dict(selo='01', cor=AZUL, titulo='tool_choice forçado',
         desc='agent.js — a saída crítica não tem outro caminho possível'),
    dict(selo='02', cor=AZUL_MED, titulo='Validação de domínio',
         desc='sefaz.js — só URL .gov.br com chave de 44 dígitos passa'),
    dict(selo='03', cor=ROXO, titulo='Perguntar, não estimar',
         desc='intencao-efeitos.js — sem número dito, vira pergunta'),
    dict(selo='04', cor=VERDE, titulo='Guarda-corpo de URL',
         desc='receita-premium.js — conferida contra o feed real'),
    dict(selo='05', cor=AMBAR, titulo='Basic Auth limita custo',
         desc='server.js — sem credencial, ninguém gasta a chave paga'),
], [
    'Cinco guardrails reais, não hipotéticos — todos já apareceram nas aulas '
    'anteriores, só que sem esse nome. Em cada um, repara no mesmo detalhe: o '
    'que exatamente o código faz que o prompt sozinho não faria. O primeiro: '
    'saída crítica nunca depende só de pedir. tool_choice é um parâmetro da '
    'chamada de API que diz "a resposta tem que vir nesse formato". Não é '
    'sugestão, é o único caminho que existe. ⏺ abrir agent.js',
    'O segundo: dado que vem de fora do meu controle passa por validação '
    'antes de custar dinheiro. A leitura de nota por QR code só tenta buscar '
    'se a URL já bate com o formato esperado — domínio .gov.br, chave de 44 '
    'dígitos — antes de fazer requisição de rede ou gastar chamada de LLM. '
    '⏺ abrir sefaz.js',
    'O terceiro é o que eu mais gosto, porque é guardrail de produto, não só '
    'de código: perguntar em vez de chutar. Se a pessoa diz que porcionou mas '
    'não diz quantas porções, o produto não estima. Ele devolve uma pergunta '
    'e não grava nada até a resposta vir completa. É a regra de ouro do '
    'projeto — "Claude nunca calcula" — aplicada a quantidade. '
    '⏺ abrir intencao-efeitos.js',
    'O quarto: a única decisão da LLM na receita premium é escolher qual '
    'vídeo do canal casa com o estoque. Mas o código confere se aquela URL '
    'existe mesmo no feed RSS antes de postar. Se não existir, é erro — não '
    'uma URL inventada indo pro Telegram de quem usa. '
    '⏺ abrir receita-premium.js',
    'E o quinto, que não parece guardrail à primeira vista: Basic Auth. Ele '
    'não protege só o acesso, protege o custo. Sem credencial, qualquer um '
    'que descobrisse a URL gastaria a minha chave paga. Por isso está '
    'documentado no SDD como requisito, não como item de segurança opcional.'])

L.statement(d, 'Nenhum confia em "pedir" quando a saída importa.', [
    'Repara no fio que atravessa os cinco. Nenhum deles delega pro modelo a '
    'responsabilidade de se comportar bem por educação. Cada um tem uma trava '
    'em código, fora do alcance do prompt. É a mesma lição das aulas '
    'anteriores: prompt não é garantia estrutural. Guardrail é.'])

L.contraste(d, 'claro', 'O freio e o motorista',
            'Guardrail não é desconfiança do modelo',
    dict(rotulo='O guardrail é o freio', cor=AZUL, titulo='Trabalho de garantia',
         itens=['Formato de saída, limite de gasto, dado validado',
                'Propriedades que o produto precisa ter 100% das vezes',
                'Eu não peço educadamente pro freio funcionar — eu construo',
                'Vale mesmo no caso raro e na versão nova do modelo']),
    dict(rotulo='O modelo é o motorista', cor=VERDE,
         titulo='Trabalho de julgamento',
         itens=['Interpretar linguagem ambígua e entender intenção',
                'Lidar com o caso que eu não previ',
                'Decidir quando frear — não construir o freio',
                'É exatamente aqui que eu confio nele']),
    ['E eu quero deixar uma coisa clara, porque é fácil ouvir isso e achar '
     'que estou dizendo "não confie no modelo". Não é isso. Eu confio no '
     'modelo pra fazer o que ele é bom em fazer: interpretar linguagem '
     'ambígua, entender intenção, lidar com o caso que eu não previ.',
     'O que eu não faço é depender dele pra garantir uma propriedade que o '
     'produto precisa ter cem por cento das vezes. Pensa assim: eu não peço '
     'educadamente pro freio do carro funcionar. Eu construo o freio, e uso o '
     'motorista — a parte inteligente, adaptável — pra decidir quando frear. '
     'Os dois são necessários, e cada um faz a parte que só ele faz bem.'])

# ======================================================== 6.2 transparência ==
L.divisor(d, '6.2 Transparência com o usuário', [
    'Antes de gravar: ter aberto telegram.js no estado atual (master, já com '
    'o fix do PR #4). Mostrar o código corrigido e citar o "antes" só de '
    'memória/slide — não reverter nada em câmera.'])

L.capa(d, 'Transparência', [
    'Segundo bloco da aula: transparência com quem usa o produto. O que '
    'comunicar sobre o uso de IA, quando e por quê.'])

L.statement(d, 'Transparência não é aviso legal genérico.', [
    'Transparência, do jeito que esta aula trata, não é um texto de rodapé '
    'dizendo "este produto usa inteligência artificial". É o produto dizer, '
    'no momento certo, o que ele sabe fazer e o que não sabe.'])

L.contraste(d, 'claro', 'Estático × dinâmico',
            'Duas ideias que costumam ser confundidas',
    dict(rotulo='Aviso legal', cor=TXT_FRACO, titulo='Sempre igual, sempre lá',
         itens=['Não muda com o que está acontecendo agora',
                'Protege juridicamente — talvez',
                'Não ajuda a entender uma interação específica',
                'O usuário lê uma vez e nunca mais']),
    dict(rotulo='Comportamento', cor=AZUL, titulo='Reage ao que acabou de acontecer',
         itens=['Se o produto não sabe processar, ele diz ali, na hora',
                'Se processou bem, a resposta certa já basta',
                'É específico sobre aquela coisa, não sobre o produto',
                'Fecha a lacuna entre "funcionou" e "inventou"']),
    ['Repara na diferença entre as duas ideias. Um aviso legal genérico é '
     'estático — está lá, sempre igual, independente do que está acontecendo '
     'naquele instante. Transparência de comportamento é dinâmica: ela reage '
     'ao que está acontecendo.',
     'E por que isso importa tanto num produto com IA? Porque a IA erra de um '
     'jeito diferente do software tradicional. Um formulário que não aceita '
     'um campo mostra um erro vermelho na hora. Um modelo que não sabe '
     'processar uma entrada pode simplesmente não fazer nada de errado '
     'visível — ou pior, responder confiante e errado. Transparência é '
     'garantir que existe sempre um terceiro caminho, além de "funcionou" e '
     '"inventou uma resposta": o caminho de avisar que não sabe.'])

L.chat(d, 'A foto do cupom, antes e depois',
       'Episódio B da Aula 4 — mesma capacidade técnica nos dois lados', [
    dict(lado='dir', rotulo='Renata manda', cor=AZUL, fundo=AZUL,
         texto='📷 cupom-mercado.jpg', texto_cor='FFFFFF'),
    dict(lado='esq', rotulo='Antes — até 11/09', cor=VERMELHO, vazia=True,
         fundo=BG_CLARO, texto_cor=TXT_MEDIO,
         texto='(nenhuma resposta · nenhum log · nenhum trace)'),
    dict(lado='esq', rotulo='Depois — PR #4, no ar desde 12/09', cor=VERDE,
         fundo=CARD_CLA, borda=BORDA_CLA, texto_cor=TXT_FORTE,
         texto='Ainda não sei ler foto de cupom, me manda o link do QR ou o texto.'),
], [
    'O exemplo mais concreto do curso inteiro pra isso é o episódio B da Aula '
    '4. Alguém manda uma foto de cupom pro bot.',
    'Antes do PR quatro: nenhuma resposta. Nem log, nem trace, nem mensagem. '
    'Vale se colocar no lugar de quem mandou. Você manda a foto, espera, nada '
    'acontece. O que você conclui? Que o bot travou? Que sua mensagem não '
    'chegou? Que você fez algo errado? A ausência de resposta não é neutra — '
    'ela custa confiança, porque o usuário preenche esse vazio com a pior '
    'hipótese disponível.',
    'Depois do fix: a mesma foto, e em segundos vem uma resposta específica — '
    'ainda não sei ler isso, mas aqui está o que eu sei fazer no lugar. Não é '
    'só mais educado, é acionável. E teve um efeito colateral que eu não '
    'esperava: o suporte para de receber "o bot não funciona" e passa a '
    'receber "o bot ainda não lê foto, adiciona isso?". A queixa vira pedido '
    'de feature. É outra categoria de problema.'])

L.linhas(d, 'escuro', 'O que mudou — e o que não mudou',
         'A diferença inteira cabe em uma linha', [
    dict(selo='=', cor=TXT_FRACO, titulo='A capacidade técnica',
         desc='Idêntica nos dois lados. O produto continua sem saber ler foto '
              'de cupom'),
    dict(selo='=', cor=TXT_FRACO, titulo='O custo de construir',
         desc='Algumas linhas: uma checagem de tipo de mensagem e um texto de '
              'resposta'),
    dict(selo='≠', cor=VERDE, titulo='O que mudou',
         desc='Só ele ter dito. E isso já é a correção'),
], [
    'E repara: a capacidade técnica é idêntica nos dois lados. O produto '
    'continua sem saber ler foto de cupom.',
    'O custo de construir isso também é pequeno — uma checagem de tipo de '
    'mensagem e um texto de resposta. Segura essa informação, porque ela volta '
    'no próximo slide.',
    'A única coisa que mudou foi ele ter dito. E é exatamente aí que está a '
    'correção.'])

L.statement(d, 'Admitir a limitação já é uma correção.', [
    'Esse é o ponto pedagógico central, direto da Aula 4. O bug real nunca foi '
    '"não saber ler foto" — sistema tem limite, tudo bem. O bug era não dizer '
    'que não sabia. E isso generaliza: toda resposta "não sei fazer isso" é '
    'mais transparente, e mais barata de construir, do que fingir que '
    'processou algo que não processou.'])

L.cards(d, 'claro', 'Por que a correção barata vem primeiro', None, [
    dict(rotulo='Custo', cor=VERDE, titulo='Dizer "não sei" é barato',
         itens=['Uma checagem de tipo e um texto de resposta',
                'Fecha o pior sintoma no mesmo dia',
                'Não exige decisão de arquitetura']),
    dict(rotulo='Ordem', cor=AZUL, titulo='Capacidade nova é cara',
         itens=['Ler a foto de verdade veio depois, no 4.3',
                'Exigiu integração com a SEFAZ',
                'Um desenho que eu tentei e não funcionou antes de achar o que '
                'funcionava']),
    dict(rotulo='Dano evitado', cor=ROXO, titulo='Silêncio também é um dano',
         itens=['Não impede ação perigosa — impede outro tipo de dano',
                'O de deixar alguém confiando numa resposta que nunca existiu',
                'Transparência e guardrail protegem a mesma coisa: a confiança']),
], [
    'Eu falei "mais barata" de propósito, porque tem um argumento de '
    'engenharia escondido aqui, não só um argumento ético. Ensinar o produto a '
    'dizer "não sei" é uma correção pequena: algumas linhas, uma checagem de '
    'tipo de mensagem, um texto de resposta.',
    'Ensinar o produto a de fato ler a foto — que foi a correção seguinte, no '
    'vídeo 4.3 — exigiu decisão de arquitetura, integração com a SEFAZ, um '
    'desenho que eu tentei e não funcionou antes de achar o que funcionava. A '
    'ordem importa: eu fechei o buraco barato e imediato antes de investir no '
    'problema caro. Se eu tivesse feito ao contrário, o produto teria ficado '
    'mudo por mais tempo esperando uma correção difícil.',
    'E tem uma última camada que eu quero que fique: dizer "não sei" '
    'publicamente também é um tipo de guardrail. Não impede uma ação perigosa, '
    'mas impede um dano diferente — o de deixar alguém confiando numa resposta '
    'que nunca existiu. Transparência e guardrail estão protegendo a mesma '
    'coisa por ângulos diferentes: a confiança de quem usa o produto.'])

# ================================================================= 6.3 LGPD ==
L.divisor(d, '6.3 LGPD na prática', [
    'Antes de gravar: ter aberto schema.sql (colunas telegram_chat_id e '
    'telegram_user_id) e o trecho do SDD §13.8 sobre RLS desligado. '
    '⚠ NÃO abrir o Supabase com dado real em tela cheia — são conversas reais '
    'de casa. Se for mostrar, corte ou borre antes.'])

L.capa(d, 'LGPD na prática', [
    'Terceiro bloco: LGPD. Quais dados o produto coleta, como usa, e o que ele '
    'precisa garantir a quem usa — com o que eu tenho hoje, e com o que eu '
    'ainda não tenho.'])

L.statement(d, 'Dado sensível não é só CPF.', [
    'Quando a gente pensa em dado pessoal sensível, o reflexo é CPF, cartão, '
    'prontuário médico. Mas rotina familiar também é dado pessoal — o que a '
    'casa comeu, o que desejou, quanto gastou. Não é dado financeiro nem de '
    'saúde no sentido estrito. É íntimo o suficiente pra merecer o mesmo '
    'cuidado.'])

L.citacao(d, 'claro', 'O que a lei chama de dado pessoal', None,
          'Qualquer informação relacionada a pessoa natural identificada ou '
          'identificável.', 'LGPD, art. 5º, inciso I', [
    dict(texto='Identificada', cor=AZUL),
    dict(texto='Identificável', cor=AZUL_MED),
    dict(texto='Padrão de comportamento', cor=ROXO),
], [
    'E a própria LGPD é explícita sobre isso: dado pessoal é qualquer '
    'informação relacionada a pessoa natural identificada ou identificável. '
    'Não é uma lista fechada de campos sensíveis tipo CPF ou dado de saúde.',
    'Se o dado permite identificar alguém, ele entra na definição. O log do meu '
    'produto sabe que horas a casa janta, o que ela evita comer, quando alguém '
    'desperdiçou comida, quando teve vontade de alguma coisa às dez da noite.',
    'Junta isso ao longo de meses e você tem um retrato bem íntimo de uma '
    'rotina familiar — que é exatamente o tipo de coisa que a LGPD existe pra '
    'proteger, mesmo sem nenhum CPF em lugar nenhum. É fácil um time pensar '
    '"eu não coleto dado sensível, meu produto é só sobre receita e estoque" — '
    'e é exatamente aí que a exposição acontece. Não dá pra proteger o que '
    'você não admite que precisa de proteção.'])

L.linhas(d, 'escuro', 'O que o Musa Balance coleta',
         'Nenhum é telemetria escondida — os três são dado funcional', [
    dict(selo='ID', cor=AZUL, titulo='telegram_chat_id e telegram_user_id',
         desc='Identificam pessoas reais numa conversa real, ligados à tabela '
              'de atores da casa'),
    dict(selo='LOG', cor=ROXO, titulo='pensamentos',
         desc='O log cru de tudo que os dois atores conversam sobre comida: o '
              'que comeram, o que desejam, quanto gastaram'),
    dict(selo='EST', cor=VERDE, titulo='Itens de estoque ligados à casa',
         desc='O que tem na geladeira, quanto sobrou, quando vence'),
], [
    'O que o produto coleta, concretamente: identificação de pessoas reais numa '
    'conversa real. ⏺ mostrar schema.sql, apontar as colunas — sem abrir '
    'nenhuma linha de dado real.',
    'O log cru de tudo que a casa conversa sobre comida. E o telegram_chat_id '
    'merece uma palavra à parte, porque é o tipo de dado que passa '
    'despercebido: não parece pessoal, é só um número que identifica um chat. '
    'Mas cruzado com o resto — quem mandou, em que chat, sobre o quê — ele '
    'reidentifica uma pessoa real de um jeito que nenhum pseudônimo apagaria.',
    'E os itens de estoque ligados à casa. Nenhum desses três é telemetria '
    'escondida — são o dado funcional que faz o produto funcionar. É '
    'exatamente por isso que a decisão de como proteger importa tanto.'])

L.contraste(d, 'claro', 'Dado funcional × telemetria escondida',
            'A distinção que muda como eu penso em risco',
    dict(rotulo='Telemetria escondida', cor=TXT_FRACO,
         titulo='O produto funciona sem ela',
         itens=['Analytics de clique, por exemplo',
                'Dá pra parar de coletar e reduzir risco na hora',
                'A pergunta certa é "por que estou guardando isso?"']),
    dict(rotulo='Dado funcional', cor=AZUL, titulo='O dado é o produto',
         itens=['Se eu apagasse pensamentos agora, tudo para de funcionar',
                'É literalmente o feed que o resto do sistema lê',
                'Não dá pra coletar menos — o trabalho é proteger melhor']),
    ['Vale separar essa distinção com cuidado, porque ela muda completamente '
     'como eu penso em risco. Telemetria escondida é dado que o produto junta '
     'sem que o funcionamento dependa dele — analytics de clique, por exemplo. '
     'Nesse caso a saída mais fácil existe: parar de coletar.',
     'Dado funcional é o oposto. Se eu apagasse pensamentos agora, o produto '
     'inteiro para de funcionar, porque é literalmente o feed, a fonte de tudo '
     'que o resto do sistema lê. Isso significa que eu não posso simplesmente '
     '"parar de coletar" pra reduzir risco — o dado é o produto. O trabalho '
     'não é coletar menos, é proteger melhor o que é inevitavelmente '
     'necessário.'], simbolo='vs')

L.cards(d, 'claro', 'Onde a proteção está — e onde não está',
        'Honestidade sobre uma escolha real do projeto', [
    dict(rotulo='RLS — desligado', cor=VERMELHO,
         titulo='De propósito, e documentado',
         itens=['Household único: não existe outro tenant pra vazar dado',
                'Se virasse multi-tenant, deixaria de ser aceitável na hora',
                'Documentado no SDD §13.8 — o registro é o que garante revisão']),
    dict(rotulo='Service role key', cor=VERDE, titulo='A proteção de fato, hoje',
         itens=['Nunca chega ao navegador',
                'Só o backend toca as tabelas sensíveis',
                'Cobre o risco que existe hoje: acesso direto de fora']),
    dict(rotulo='Basic Auth', cor=AMBAR, titulo='Gate de acesso, não de LGPD',
         itens=['Única barreira entre o dado real e quem descobrir a URL',
                'Não tem limite de uso depois de autenticado',
                'Requisito documentado no SDD §8']),
], [
    'Aqui eu preciso ser honesto sobre uma escolha real do projeto. O RLS — '
    'segurança em nível de linha, que isola um tenant do outro dentro do banco '
    '— está desligado, de propósito, no Supabase. "Desligar segurança de '
    'propósito" soa alarmante fora de contexto, então deixa eu explicar onde '
    'termina a decisão razoável e onde começaria o risco real. RLS resolve um '
    'problema específico: várias contas no mesmo banco, cada uma enxergando só '
    'a própria linha. Meu produto hoje tem uma casa. Uma. ⏺ mostrar SDD §13.8',
    'A camada que eu tenho no lugar é essa: só o backend, com a chave de '
    'serviço, toca essas tabelas, e o navegador nunca recebe essa chave. Isso '
    'cobre exatamente o risco que existe hoje — alguém de fora acessando o '
    'banco. O risco que o RLS cobriria, um tenant lendo dado do outro, '
    'simplesmente não existe ainda.',
    'E o Basic Auth do deploy público funciona como gate de acesso, não como '
    'controle de LGPD — mas é a única barreira entre os dados reais da casa e '
    'qualquer pessoa que descubra a URL. Se esse produto virasse multi-tenant, '
    'a decisão do RLS deixaria de ser aceitável na hora. É por isso que '
    'documentar importa tanto quanto decidir: o registro escrito é o que '
    'garante que alguém vai revisitar a escolha quando o escopo mudar, em vez '
    'dela sobreviver por inércia.'])

L.statement(d, 'Quem tem direito de pedir a exclusão? O produto sabe atender?', [
    'E aqui fica a pergunta que eu deixo em aberto de propósito — é exatamente '
    'a pergunta que o checklist do próximo vídeo formaliza. Hoje não existe '
    'rota de exclusão nem prazo de retenção automático. É uma pendência '
    'honesta, não uma solução. E ela é mais difícil do que parece: pensamentos '
    'é o histórico que o produto usa pra saber que a lasanha ainda tem cinco '
    'porções. Apagar uma linha de conversa pode apagar junto o único registro '
    'de um evento que ainda importa. Isso não é motivo pra não construir o '
    'mecanismo — é motivo pro mecanismo ser desenhado com cuidado. Mas até '
    'esse desenho existir, a resposta honesta é "eu faço manualmente, sem '
    'processo formal" — e isso precisa estar escrito em algum lugar, não '
    'descoberto na hora que alguém pedir.'])

# ============================================================ 6.4 checklist ==
L.divisor(d, '6.4 Checklist de conformidade', [
    'Antes de gravar: ter aberto docs/aula5-checklist-conformidade.md. Este '
    'vídeo é leitura guiada do documento — o slide é o resumo, não substitui '
    'a tabela.'])

L.capa(d, 'Checklist', [
    'Quarto bloco: o checklist. Tudo que apareceu nos três vídeos anteriores '
    'vira uma lista aplicável a qualquer produto com IA, não só ao meu.'])

L.statement(d, 'Não é uma lista de "está tudo certo".', [
    'Tudo que apareceu nos três vídeos anteriores vira um checklist aplicável '
    'a qualquer produto com IA. E ele é honesto sobre o que falta — não é uma '
    'lista de "está tudo certo". É uma lista de "aqui está onde a gente está, '
    'aqui está o que falta". Por que um checklist, e não só bom senso? Porque '
    'bom senso não escala e não deixa rastro. Se eu perguntar pra mim mesmo, '
    'de cabeça, "meu produto está bem?", a resposta tende a ser sim — ninguém '
    'audita a própria memória com rigor.'])

L.semaforo(d, 'escuro', 'O checklist, resumido',
           'Uma resposta por item, específica, que alguém de fora confere depois',
    [dict(rotulo='Sim', cor=VERDE),
     dict(rotulo='Parcial', cor=AMBAR),
     dict(rotulo='Não / em falta', cor=VERMELHO)],
    [dict(nome='Guardrails', celulas=[
        'tool_choice forçado, validação de domínio, pergunta em vez de estima',
        'Basic Auth sem limite de uso por usuário',
        '—']),
     dict(nome='Transparência', celulas=[
        'Nenhum caminho termina em silêncio no Telegram',
        'A convenção semSilencio é caso a caso, não automática',
        'Falha silenciosa de estado segue sem monitoramento']),
     dict(nome='LGPD', celulas=[
        'Dado pessoal mapeado; segredos fora do versionamento',
        'Minimização: pensamentos é funcional e é o mais sensível',
        'RLS desligado; sem retenção nem exclusão'])],
    [
    'Rodo as três seções como pergunta de sim, não ou parcial. ⏺ abrir o '
    'checklist real e percorrer a coluna "como o produto está hoje".',
    'Guardrails: a maioria já é sim, porque são os mesmos cinco do primeiro '
    'vídeo. Não pulei pra parcial sem escrever o que falta pra virar sim — '
    'Basic Auth protege o acesso, mas não tem limite de uso depois de '
    'autenticado.',
    'Transparência: nenhum caminho termina em silêncio no Telegram. Mas a '
    'convenção é aplicada caso a caso, não automática — e a falha silenciosa '
    'de estado, o caso da lasanha, segue sem monitoramento.',
    'E LGPD. Reparo especificamente no "parcial", porque é a resposta que mais '
    'gente evita dar. É desconfortável escrever "meio que sim, mas não '
    'completamente" — parece mais fraco que um sim limpo. Mas é a resposta mais '
    'honesta na maioria dos produtos reais, e fingir que é sim só empurra a '
    'descoberta do não pro pior momento possível: quando já é incidente, não '
    'mais checklist.'])

L.linhas(d, 'claro', 'O que está em falta, sem rodeio',
         'Três pendências, cada uma com decisão registrada', [
    dict(selo='1', cor=VERMELHO, titulo='Falha silenciosa de estado',
         desc='O caso da lasanha continua sem monitoramento. Risco aceito e '
              'registrado na Aula 4'),
    dict(selo='2', cor=VERMELHO, titulo='RLS desligado',
         desc='Aceitável no escopo de uma casa. Revisar no dia em que existir '
              'uma segunda'),
    dict(selo='3', cor=VERMELHO, titulo='Sem retenção nem exclusão',
         desc='Não existe rota nem prazo. Hoje a resposta honesta é '
              '"manualmente, sem processo formal"'),
], [
    'Três coisas estão marcadas como pendência, sem prazo definido. A primeira: '
    'a falha silenciosa de estado — o caso da lasanha, que continua sem '
    'monitoramento.',
    'A segunda: o RLS desligado, que a gente acabou de discutir.',
    'E a terceira: a ausência de qualquer política de retenção ou exclusão de '
    'dado. Nenhuma delas está escondida. Todo item marcado como pendência tem '
    'uma decisão explícita registrada: aceito o risco, ou vou corrigir até tal '
    'data. Nunca um "não" sem dono.'])

L.statement(d, 'O problema não é ter pendência. É pendência sem dono.', [
    'Eu quero fechar esse vídeo com a distinção que separa maturidade de '
    'negligência: ter pendência não é o problema. Todo produto real tem '
    'pendência — quem diz que não tem está escondendo ou não sabe. O problema '
    'é pendência sem dono, sem data, sem registro — aquela que ninguém decidiu '
    'conscientemente manter, que só está lá porque ninguém olhou. As três '
    'daqui foram olhadas. Alguém — no caso, eu — decidiu "sim, eu sei que isso '
    'existe, o risco é aceitável nesse escopo, e está escrito onde qualquer um '
    'confere depois". É essa decisão registrada que separa um risco gerenciado '
    'de um acidente esperando pra acontecer.'])

# ====================================================== 6.5 o que aprendemos ==
L.divisor(d, '6.5 O que aprendemos?', [
    'Fechamento da aula. Sem demo, sem terminal — só slide.'])

L.capa(d, 'O que aprendemos', [
    'Três lições, uma por pilar desta aula.'])

L.cards(d, 'claro', 'Três lições, uma por pilar', None, [
    dict(rotulo='Guardrail', cor=AZUL, titulo='Limite em código, não intenção em prompt',
         itens=['Os cinco guardrails reais seguem o mesmo padrão',
                'Nunca confiar só em pedir',
                'Prompt não é garantia estrutural']),
    dict(rotulo='Transparência', cor=VERDE,
         titulo='Dizer, no momento certo, o que não sabe fazer',
         itens=['"Admitir já é corrigir"',
                'Mais barato de construir que fingir que processou',
                'Nenhum caminho termina em silêncio']),
    dict(rotulo='LGPD', cor=ROXO, titulo='Rotina também é dado pessoal',
         itens=['Reconhecer antes de proteger',
                'Documentar onde a proteção existe e onde não existe',
                'O checklist formaliza os três pra qualquer produto']),
], [
    'Guardrail é limite em código, não intenção em prompt — os cinco '
    'guardrails reais do produto seguem o mesmo padrão: nunca confiar só em '
    'pedir.',
    'Transparência é o produto dizer, no momento certo, o que não sabe fazer — '
    '"admitir já é corrigir".',
    'E LGPD em produtos com IA começa em identificar que dado de rotina também '
    'é dado pessoal — e em documentar honestamente onde a proteção existe e '
    'onde ainda não existe. O checklist formaliza os três como algo aplicável '
    'a qualquer produto, não só a este.'])

L.statement(d, 'Eu construo pra que dar errado seja visível, contido e registrado.', [
    'Se eu tivesse que resumir os três numa frase só, seria essa: cada um '
    'deles existe porque, em algum momento, alguém — eu, neste caso — teve que '
    'admitir que o modelo sozinho não garante uma propriedade que o produto '
    'precisa ter. Guardrail admite isso pro comportamento. Transparência '
    'admite isso pra comunicação. LGPD admite isso pro dado. Os três são a '
    'mesma postura, aplicada em três lugares diferentes.'])

# =========================================================== 6.6 conclusão ===
L.divisor(d, '6.6 Conclusão', [
    'Fechamento do curso inteiro. Sem demo — amarrar os três pilares e '
    'encerrar.'])

L.capa(d, 'Conclusão', [
    'Último vídeo. Volto ao gancho da Aula 1 e fecho os três pilares com '
    'conteúdo real por trás de cada um.'])

L.pilares(d, 'escuro', 'Os três pilares, com conteúdo real', None, [
    dict(numero='01', cor=AZUL, titulo='Evals',
         itens=['Critério mensurável + juiz com saída forçada',
                'Resultado gravado como Score no Langfuse',
                'Define o que é bom']),
    dict(numero='02', cor=AZUL_MED, titulo='Observabilidade',
         itens=['Trace e custo reais: US$ 1,54 num mês',
                'Quatro padrões de falha detectados',
                'Duas corrigidas, dois riscos aceitos']),
    dict(numero='03', cor=VERDE, titulo='Conformidade responsável',
         itens=['Guardrail em código, transparência no produto',
                'LGPD como prática, não rodapé',
                'Decide o que fazer com o que foi visto']),
], 'Eval → observabilidade → conformidade: o ciclo de maturidade, nessa ordem', [
    'Volto ao gancho da Aula 1: lançar é o começo, não o fim. Agora com '
    'conteúdo real por trás de cada pilar. Evals: critério mensurável, Claude '
    'como juiz com saída forçada, resultado gravado de volta no Langfuse.',
    'Observabilidade: trace real, custo real, quatro padrões de falha reais — '
    'duas corrigidas ao vivo, duas que eu escolhi manter como risco aceito e '
    'registrado, não escondido.',
    'E conformidade responsável: guardrail em código, transparência como '
    'comportamento do produto, LGPD como prática.',
    'Repara que os três apareceram na ordem certa, e essa ordem não é acaso. '
    'Eval vem primeiro porque sem critério mensurável eu nem sei reconhecer uma '
    'falha quando ela aparece. Observabilidade vem depois porque, com o '
    'critério definido, eu preciso do dado real pra aplicar aquele critério '
    'contra o que está de fato acontecendo. E conformidade fecha o ciclo, '
    'porque sobra a pergunta mais difícil: o que eu faço com o que eu vi — '
    'corrijo, documento como risco aceito, ou finjo que não vi?'])

L.statement(d, 'Nenhum dos três funciona sozinho.', [
    'O eval que não vira dado observável não gera aprendizado. A '
    'observabilidade sem guardrail vira incidente. O guardrail sem eval nunca '
    'sabe se está funcionando de verdade. O produto que você acabou de ver por '
    'dentro rodou — errou, foi corrigido, errou de novo — com os três juntos.'])

L.linhas(d, 'claro', 'Tira uma perna, a mesa cai',
         'Três armadilhas reais, uma por combinação que falta', [
    dict(selo='−O', cor=VERMELHO, titulo='Eval sem observabilidade',
         desc='Um juiz caprichado que só roda quando alguém lembra, contra um '
              'punhado de casos de teste. A produção segue sem critério'),
    dict(selo='−G', cor=VERMELHO, titulo='Observabilidade sem guardrail',
         desc='Você vê tudo, em tempo real, bonito no painel — e nada impede a '
              'próxima falha. Ver não é prevenir'),
    dict(selo='−E', cor=VERMELHO, titulo='Guardrail sem eval',
         desc='Você trava um comportamento perigoso e nunca mede se a trava '
              'barra demais, irritando quem usa, ou de menos'),
], [
    'Deixa eu mostrar cada uma dessas três falhas de fé, porque cada uma é uma '
    'armadilha real que eu já vi times caírem. Eval sem observabilidade: você '
    'constrói um juiz caprichado, mas ele só roda quando alguém lembra de '
    'mandar rodar, contra um punhado de casos de teste — e a produção, que é '
    'onde a vida real acontece, segue sem nenhum critério aplicado nela.',
    'Observabilidade sem guardrail: você vê tudo, em tempo real, bonito no '
    'painel — e continua sem nada que impeça a próxima falha de acontecer de '
    'novo, porque ver não é o mesmo que prevenir.',
    'Guardrail sem eval: você trava um comportamento perigoso, mas nunca mede '
    'se aquela trava está funcionando bem, ou se está travando coisa demais e '
    'irritando quem usa, ou de menos e deixando passar o que devia barrar. Os '
    'três juntos formam um ciclo que se sustenta. Tira uma perna, a mesa cai.'])

L.hero(d, 'Lançar é o começo.', 'O run é o resto da história.', [
    'Lançar é o começo, não o fim.',
    'O run — evals, observabilidade, conformidade — é o resto da história, e é '
    'o que separa um produto de IA que sobrevive ao primeiro mês de um que '
    'não.',
    'Se você chegou até aqui achando que precisava de um produto grande, com '
    'time grande, pra fazer tudo isso — não precisa. Tudo que eu mostrei nessas '
    'aulas rodou numa casa só, com uma pessoa mantendo o código, gastando um '
    'dólar e cinquenta e quatro num mês inteiro de uso real. O tamanho do '
    'produto não é desculpa pra pular o run. Aplica o mesmo ciclo no seu '
    'produto: detecte, diagnostique, corrija, registre o risco que sobrar. '
    'Até a próxima.'])

# ================================================================== salvar ===
total = d.salvar(os.path.abspath(DESTINO), MANIFESTO)
print('%d slides -> %s' % (total, os.path.abspath(DESTINO)))

gera_referencia(ORIGEM, os.path.join(AQUI, 'aula6-referencia.pptx'),
                os.path.join(AQUI, 'aula6-referencia.json'))
print('referencia de chrome -> aula6-referencia.pptx')
