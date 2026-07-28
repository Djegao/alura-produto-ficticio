// Precisa ser importado ANTES de qualquer outro modulo da aplicacao (server.js
// faz isso na primeira linha). Le LANGFUSE_SECRET_KEY, LANGFUSE_PUBLIC_KEY e
// LANGFUSE_BASE_URL do .env — sem essas variaveis o SDK ainda funciona
// localmente (gera trace_id normalmente), so nao consegue exportar para o
// dashboard do Langfuse.
require('dotenv').config();

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { LangfuseSpanProcessor } = require('@langfuse/otel');

const sdk = new NodeSDK({
  spanProcessors: [new LangfuseSpanProcessor()],
});

sdk.start();

module.exports = { sdk };
