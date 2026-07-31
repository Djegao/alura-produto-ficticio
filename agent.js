// O nucleo agentico: Claude decide se/quando chamar consultar_estoque e
// consultar_preferencias antes de responder. Cada chamada ao modelo e cada
// chamada de ferramenta viram observacoes proprias no Langfuse, aninhadas
// dentro de um span "agent" — da pra ver a arvore de decisao inteira no
// dashboard, nao so o resultado final.

const Anthropic = require('@anthropic-ai/sdk');
const { startObservation } = require('@langfuse/tracing');
const { toolDefinitions, runTool } = require('./tools');
const { PROMPTS } = require('./prompts');

const anthropic = new Anthropic(); // le ANTHROPIC_API_KEY do ambiente

const MAX_ITERATIONS = 5;

async function sugerirReceita({ promptText, model, promptVersion }) {
  const systemPrompt = promptVersion === 'v2' ? PROMPTS.v2 : PROMPTS.v1;

  const agent = startObservation(
    'sugerir-receita',
    { input: { promptText, model, promptVersion } },
    { asType: 'agent' }
  );
  const traceId = agent.traceId;

  let messages = [{ role: 'user', content: promptText }];
  let finalText = '';
  let toolCallCount = 0;
  let itemsUsed = [];
  let consultouEstoque = false;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const generation = agent.startObservation(
        'chamada-claude',
        { input: messages, model },
        { asType: 'generation' }
      );

      const response = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        tools: toolDefinitions,
        messages,
      });

      generation.update({
        output: response.content,
        usageDetails: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      });
      generation.end();

      messages.push({ role: 'assistant', content: response.content });

      // O texto da receita pode vir numa mesma resposta que tambem chama uma
      // tool (ex: explica a receita E chama registrar_itens_usados no mesmo
      // turno) — captura sempre que houver texto, nao so na resposta final.
      const textBlock = response.content.find((b) => b.type === 'text');
      if (textBlock && textBlock.text) finalText = textBlock.text;

      if (response.stop_reason !== 'tool_use') break;

      const toolResults = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        toolCallCount++;

        if (block.name === 'registrar_itens_usados' && Array.isArray(block.input.itens)) {
          itemsUsed = block.input.itens;
        }
        if (block.name === 'consultar_estoque') consultouEstoque = true;

        const toolSpan = agent.startObservation(
          block.name,
          { input: block.input },
          { asType: 'tool' }
        );

        let output;
        try {
          output = await runTool(block.name, block.input);
          toolSpan.update({ output });
        } catch (e) {
          output = { error: e.message };
          toolSpan.update({ output, level: 'ERROR' });
        }
        toolSpan.end();

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(output),
        });
      }
      messages.push({ role: 'user', content: toolResults });
    }

    // O prompt (v2) PEDE pro Claude chamar registrar_itens_usados, mas pedir
    // em linguagem natural nao e garantia — na pratica ele as vezes escreve a
    // receita com quantidades e simplesmente nao chama a tool. Se isso
    // aconteceu (consultou estoque mas nao registrou), forca uma chamada
    // extra com tool_choice — isso e' garantia estrutural da API, nao mais um
    // pedido no prompt.
    if (itemsUsed.length === 0 && consultouEstoque) {
      messages.push({
        role: 'user',
        content:
          'Com base na receita que voce acabou de sugerir e no estoque que voce consultou, registre agora os itens e as quantidades que a receita usa.',
      });

      const forceGen = agent.startObservation(
        'forcar-registro-consumo',
        { input: messages, model, metadata: { motivo: 'tool_choice forcado — prompt sozinho nao garantiu a chamada' } },
        { asType: 'generation' }
      );

      const forceResponse = await anthropic.messages.create({
        model,
        max_tokens: 512,
        system: systemPrompt,
        tools: toolDefinitions,
        tool_choice: { type: 'tool', name: 'registrar_itens_usados' },
        messages,
      });

      forceGen.update({
        output: forceResponse.content,
        usageDetails: {
          input: forceResponse.usage.input_tokens,
          output: forceResponse.usage.output_tokens,
        },
      });
      forceGen.end();

      const forcedBlock = forceResponse.content.find(
        (b) => b.type === 'tool_use' && b.name === 'registrar_itens_usados'
      );

      if (forcedBlock && Array.isArray(forcedBlock.input.itens)) {
        itemsUsed = forcedBlock.input.itens;
        toolCallCount++;

        const toolSpan = agent.startObservation(
          'registrar_itens_usados',
          { input: forcedBlock.input, metadata: { forced: true } },
          { asType: 'tool' }
        );
        const output = await runTool('registrar_itens_usados', forcedBlock.input);
        toolSpan.update({ output });
        toolSpan.end();
      }
    }

    agent.update({ output: finalText, metadata: { toolCallCount, itemsUsedCount: itemsUsed.length } });
    return { text: finalText, traceId, toolCallCount, itemsUsed };
  } catch (err) {
    agent.update({ level: 'ERROR', statusMessage: err.message });
    throw err;
  } finally {
    agent.end();
  }
}

module.exports = { sugerirReceita };
