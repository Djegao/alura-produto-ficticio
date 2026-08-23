# Nota fiscal por foto — decisões e evidências

Construído em 2026-08-23. Este documento existe para um caso específico e
improvável: **uma nota de fora de São Paulo**. Tudo aqui foi testado com
notas reais, não deduzido.

## A decisão de escopo

**Só São Paulo.** O produto é uma demo de aula com um único usuário, que
compra exclusivamente na cidade de São Paulo. Cobrir 27 unidades federativas
seria over-engineering puro. Se um dia aparecer uma nota de outro estado, o
resto deste documento diz o que fazer.

## A evidência que definiu a arquitetura

Testes feitos em 23/08 com duas notas reais de SP (chaves confirmadas no
dígito verificador):

| Tentativa | Resultado |
|---|---|
| `fetch` com **só a chave** de 44 dígitos (`?p=<chave>`) | ❌ devolve só a casca da página (20.278 bytes, idêntico ao de uma chave falsa) |
| Navegador real, com JS, **só a chave** | ❌ renderiza apenas "Consulta Pública por QR Code", sem dados |
| `fetch` com o **payload completo do QR** | ✅ HTML puro com todos os itens, valores, CNPJ e endereço (12.354 bytes) |

**Conclusão**: a SEFAZ-SP exige o payload completo
(`chave|versão|ambiente|idToken|hash`). O hash de assinatura **só existe
dentro do QR code** — não está impresso no cupom. Portanto ler os 44 dígitos
por visão não abre a nota; **decodificar o QR abre**.

Isso derrubou o desenho inicial (visão lê a chave → monta a URL) e produziu
o atual.

### O aviso de JavaScript é uma pista falsa

A página de SP contém "Seu navegador não dá suporte a JavaScript" — mas
dentro de um `<noscript>`, que só aparece quando o JS está desligado. O
portal **renderiza no servidor**. Quem vir essa string no HTML e concluir
"precisa de headless browser" vai gastar esforço à toa.

## A escada de tentativas

1. **Decodificar o QR da foto** (`jsqr` + `jpeg-js`, ambos JS puro, sem
   dependência nativa). Determinístico, sem LLM, e devolve dado oficial.
   Tenta em tamanho cheio e depois reduzido em 2×, 3× e 4× — reduzir
   frequentemente acha o QR que falhou em resolução cheia.
2. **Visão lê os itens** da própria imagem. Só quando o QR não decodifica
   *e* os itens aparecem na foto. Marcado como confiança `estimada`, com
   aviso explícito ao usuário de que não é dado oficial.
3. **Perguntar**, dizendo exatamente o que faltou. Nunca inventar, nunca
   silenciar.

A chave lida por visão não serve para consultar, mas serve para **conferir**:
o último dígito é verificador (módulo 11), calculável em código. A LLM lê, o
código verifica — a regra de ouro do projeto aplicada no lugar certo.

## Se aparecer uma nota de outro estado

O caminho 1 (QR) é **estado-agnóstico por natureza**: o QR carrega a URL
completa do próprio estado emissor, e `sefaz.js` só valida domínio `.gov.br`
mais chave de 44 dígitos. Então **deve funcionar sem alteração nenhuma**.

O que pode quebrar, e o que fazer:

- **Portal que renderiza só via JS.** Sintoma: `buscarNotaSefaz` lança "veio
  sem conteúdo legível". Aí o caminho é foto do cupom inteiro para cair no
  degrau 2 (visão lê itens), ou um headless browser — que eu evitaria num
  produto de demo.
- **Layout de HTML muito diferente.** Não deve importar: o HTML vira texto
  plano e quem interpreta é o extrator LLM, que é agnóstico de layout de
  propósito (nada de parser por UF).
- **Identificar o estado**, se um dia for preciso: são os **dois primeiros
  dígitos da chave** (35 = SP, 33 = RJ, 31 = MG, 41 = PR, 43 = RS, 42 = SC,
  29 = BA, 52 = GO, 23 = CE).

## A regra do bot quando vem foto + legenda

Quando há nota, **ela é a verdade sobre o estoque; a legenda é conversa**.

Sem essa regra, uma mensagem real como *"fui no mercado e peguei um cacho
imenso de bananas"* enviada junto com a nota faria as bananas entrarem duas
vezes — uma pelo dado oficial (com peso e preço) e outra pela narrativa. E
em silêncio, que é o pecado que este produto vive catalogando.

Então a legenda:
- vira **pensamento** no feed (a conversa do casal fica registrada, que é o
  ponto do produto);
- **cruza com a lista de compras**, para riscar pendências — é o que captura
  o "sabão em pó que a gente sempre esquece", que a nota descarta por não
  ser comida;
- **nunca cria item de estoque**. "Imenso" não é uma quantidade.

E a resposta do bot é curta de propósito — o casal está conversando entre si,
não com o bot. Despejar 20 itens seria o bot se metendo na conversa.

## Limite conhecido

Funciona quando foto e legenda vêm **na mesma mensagem** (o Telegram entrega
como um update só, com `caption`). Fotos e texto enviados separadamente
viram dois eventos, e aí o texto pode duplicar itens. Correlacionar por
tempo resolveria; ainda não vale a complexidade.
