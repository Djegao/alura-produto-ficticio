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

      if (response.stop_reason !== 'tool_use') {
        const textBlock = response.content.find((b) => b.type === 'text');
        finalText = textBlock ? textBlock.text : '';
        break;
      }

      const toolResults = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        toolCallCount++;

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

    agent.update({ output: finalText, metadata: { toolCallCount } });
    return { text: finalText, traceId, toolCallCount };
  } catch (err) {
    agent.update({ level: 'ERROR', statusMessage: err.message });
    throw err;
  } finally {
    agent.end();
  }
}

module.exports = { sugerirReceita };
