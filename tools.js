// Ferramentas que o Claude pode chamar durante a sugestao de receita.
// Cada uma consulta o Supabase de verdade — nada de dado pre-buscado pelo backend.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const HOUSEHOLD_ID_CACHE = { id: null };

async function getHouseholdId() {
  if (HOUSEHOLD_ID_CACHE.id) return HOUSEHOLD_ID_CACHE.id;
  const { data, error } = await supabase.from('households').select('id').limit(1).single();
  if (error) throw new Error('Nao foi possivel achar o domicilio: ' + error.message);
  HOUSEHOLD_ID_CACHE.id = data.id;
  return data.id;
}

const toolDefinitions = [
  {
    name: 'consultar_estoque',
    description:
      'Consulta os itens disponiveis no estoque (despensa/geladeira) do domicilio. Use para saber o que ha disponivel antes de sugerir uma receita.',
    input_schema: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          enum: ['base', 'ingrediente', 'preparado'],
          description: 'Filtra por estado do alimento. Omita para trazer todos os estados.',
        },
      },
    },
  },
  {
    name: 'consultar_preferencias',
    description:
      'Consulta as preferencias e restricoes persistentes do domicilio (ex: alergias, restricoes alimentares, gostos). Use antes de finalizar a sugestao para garantir que ela respeita o perfil da casa.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'registrar_itens_usados',
    description:
      'Registra quais itens do estoque a receita sugerida efetivamente usa, e em que quantidade. Use o "id" de cada item exatamente como veio de consultar_estoque. So chame isso depois de decidir a receita — nao chame se nao consultou o estoque.',
    input_schema: {
      type: 'object',
      properties: {
        itens: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              item_id: { type: 'string', description: 'id do item, retornado por consultar_estoque' },
              quantidade: { type: 'number', description: 'quantidade usada, na mesma unidade do item' },
            },
            required: ['item_id', 'quantidade'],
          },
        },
      },
      required: ['itens'],
    },
  },
];

async function consultar_estoque({ estado } = {}) {
  const householdId = await getHouseholdId();
  let query = supabase.from('pantry_items').select('*').eq('household_id', householdId);
  if (estado) query = query.eq('state', estado);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

async function consultar_preferencias() {
  const householdId = await getHouseholdId();
  const { data, error } = await supabase
    .from('preferences')
    .select('description')
    .eq('household_id', householdId);
  if (error) throw new Error(error.message);
  return data.map((p) => p.description);
}

async function registrar_itens_usados({ itens } = {}) {
  // Nao grava nada aqui — o agent.js captura o input desta chamada diretamente
  // (e' o dado estruturado que vira meal_suggestions.items_used). So confirma
  // pro Claude que o registro foi recebido, pra fechar o ciclo de tool_result.
  return { ok: true, itens_recebidos: Array.isArray(itens) ? itens.length : 0 };
}

async function runTool(name, input) {
  if (name === 'consultar_estoque') return consultar_estoque(input);
  if (name === 'consultar_preferencias') return consultar_preferencias(input);
  if (name === 'registrar_itens_usados') return registrar_itens_usados(input);
  throw new Error(`Ferramenta desconhecida: ${name}`);
}

module.exports = {
  toolDefinitions,
  runTool,
  getHouseholdId,
  supabase,
};
