// Nucleo agentico: Claude decide se/quando chamar consultar_estoque e
// consultar_preferencias antes de responder, retornando uma sugestao de receita
// com os itens do estoque que seriam usados.

const Anthropic = require('@anthropic-ai/sdk');
const { toolDefinitions, runTool } = require('./tools');
const { PROMPTS } = require('./prompts');

const anthropic = new Anthropic();

const MAX_ITERATIONS = 5;

async function sugerirReceita({ promptText, model, promptVersion }) {
  const systemPrompt = promptVersion === 'v2' ? PROMPTS.v2 : PROMPTS.v1;

  let messages = [{ role: 'user', content: promptText }];
  let finalText = '';
  let toolCallCount = 0;
  let itemsUsed = [];
  let consultouEstoque = false;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        tools: toolDefinitions,
        messages,
      });

      messages.push({ role: 'assistant', content: response.content });

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

        let output;
        try {
          output = await runTool(block.name, block.input);
        } catch (e) {
          output = { error: e.message };
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(output),
        });
      }
      messages.push({ role: 'user', content: toolResults });
    }

    // Se consultou estoque mas nao registrou consumo (prompt v2 pede mas nao
    // garante), forca uma chamada com tool_choice — garantia estrutural da API.
    if (itemsUsed.length === 0 && consultouEstoque) {
      messages.push({
        role: 'user',
        content:
          'Com base na receita que voce acabou de sugerir e no estoque que voce consultou, registre agora os itens e as quantidades que a receita usa.',
      });

      const forceResponse = await anthropic.messages.create({
        model,
        max_tokens: 512,
        system: systemPrompt,
        tools: toolDefinitions,
        tool_choice: { type: 'tool', name: 'registrar_itens_usados' },
        messages,
      });

      const forcedBlock = forceResponse.content.find(
        (b) => b.type === 'tool_use' && b.name === 'registrar_itens_usados'
      );

      if (forcedBlock && Array.isArray(forcedBlock.input.itens)) {
        itemsUsed = forcedBlock.input.itens;
        toolCallCount++;

        const output = await runTool('registrar_itens_usados', forcedBlock.input);
      }
    }

    return { text: finalText, toolCallCount, itemsUsed };
  } catch (err) {
    throw err;
  }
}

module.exports = { sugerirReceita };
