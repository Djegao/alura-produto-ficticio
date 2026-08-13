#!/usr/bin/env bash
# ensaio-aula4.sh — atalhos para o roteiro da Aula 4 via curl.
#
# Existe porque a UI de v1/v2 foi retirada do painel (SDD §13.5): o comparativo
# de eixos agora se demonstra por Postman/curl. Este script NAO esconde o curl —
# ele imprime o comando exato antes de rodar, porque o comando faz parte do
# conteudo da aula.
#
# Nao toca em nenhum arquivo de produto. Vive no branch ensaio-aula4.
#
# Uso:
#   ./ensaio-aula4.sh preflight              # servidor de pe? auth ok? eixo atual?
#   ./ensaio-aula4.sh eixo                   # so mostra o eixo ativo
#   ./ensaio-aula4.sh eixo v2 haiku          # troca prompt e/ou modelo
#   ./ensaio-aula4.sh sugerir "o que faco pro jantar?"
#   ./ensaio-aula4.sh reproduzir             # o achado §11.4 de proposito
#   ./ensaio-aula4.sh trace <traceId>        # monta o link do Langfuse

# Sem `set -u` de proposito: array de credenciais vazio (caso sem Basic Auth)
# explode em bash antigo com nounset ligado, e o Git Bash da maquina nao e'
# garantia de versao nova.

BASE="${BASE:-http://localhost:3300}"
cd "$(dirname "$0")"

# ---------------------------------------------------------------------------
# Credenciais. ATENCAO: o gate de Basic Auth so e' desligado quando APP_USER e
# APP_PASSWORD NAO existem no ambiente (server.js:23). O .env deste projeto TEM
# as duas, e o dotenv as carrega no npm start — entao o servidor LOCAL tambem
# pede senha. Curl sem -u aqui devolve 401, nao "servidor fora do ar".
#
# O `tr -d '\r'` nao e' paranoia: o .env esta com quebra de linha do Windows, e
# o \r entra no valor da senha se nao for removido (mesma familia do §11.5 —
# segredo corrompido por caractere invisivel no caminho).
# ---------------------------------------------------------------------------
leia_env() { grep -E "^$1=" .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\r"'; }

APP_USER="${APP_USER:-$(leia_env APP_USER)}"
APP_PASSWORD="${APP_PASSWORD:-$(leia_env APP_PASSWORD)}"
LANGFUSE_BASE_URL="${LANGFUSE_BASE_URL:-$(leia_env LANGFUSE_BASE_URL)}"
LANGFUSE_BASE_URL="${LANGFUSE_BASE_URL:-https://us.cloud.langfuse.com}"
# Preencha uma vez para o subcomando `trace` montar o link completo.
# Esta' na URL do dashboard: /project/<ESTE-PEDACO>/traces/...
LANGFUSE_PROJECT_ID="${LANGFUSE_PROJECT_ID:-}"

AUTH=()
[ -n "$APP_USER" ] && AUTH=(-u "$APP_USER:$APP_PASSWORD")

# Aliases curtos -> nomes reais aceitos por AVAILABLE_MODELS (server.js:48).
modelo_real() {
  case "$1" in
    sonnet|sonnet-5|claude-sonnet-5) echo "claude-sonnet-5" ;;
    haiku|haiku-4-5|claude-haiku-4-5) echo "claude-haiku-4-5" ;;
    opus|opus-5|claude-opus-5) echo "claude-opus-5" ;;
    "") echo "" ;;
    *) echo "__invalido__" ;;
  esac
}

# Mostra o comando na tela antes de executar (conteudo de aula), com a senha
# mascarada para nao vazar na gravacao.
eco_curl() {
  local visivel=()
  for arg in "$@"; do
    case "$arg" in
      "$APP_USER:$APP_PASSWORD") visivel+=("\$APP_USER:\$APP_PASSWORD") ;;
      *) visivel+=("$arg") ;;
    esac
  done
  printf '\n\033[2m$ curl'
  for arg in "${visivel[@]}"; do
    case "$arg" in
      *[[:space:]\{\}\"]*) printf " '%s'" "$arg" ;;
      *) printf ' %s' "$arg" ;;
    esac
  done
  printf '\033[0m\n\n'
}

# jq nao esta' garantido no Git Bash; node esta' (o projeto roda em node).
bonito() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.stringify(JSON.parse(s),null,2))}catch(e){console.log(s)}})'; }

# ---------------------------------------------------------------------------

cmd_preflight() {
  echo "=== Preflight do ensaio (Aula 4) ==="
  echo "Alvo: $BASE"
  echo

  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 5 "$BASE/api/config" 2>/dev/null)

  if [ -z "$code" ] || [ "$code" = "000" ]; then
    echo "  [x] Servidor NAO respondeu em $BASE"
    echo "      -> rode 'npm start' em outro terminal e tente de novo."
    return 1
  fi
  echo "  [ok] Servidor respondendo (HTTP $code sem credenciais)"

  if [ "$code" = "401" ] && [ -z "$APP_USER" ]; then
    echo "  [x] Pede Basic Auth mas nao achei APP_USER no .env"
    echo "      -> exporte APP_USER e APP_PASSWORD na mao antes de continuar."
    return 1
  fi
  [ "$code" = "401" ] && echo "  [ok] Basic Auth ativo — credenciais lidas do .env"

  local cfg
  cfg=$(curl -s -m 5 "${AUTH[@]}" "$BASE/api/config")
  if ! echo "$cfg" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{JSON.parse(s)})' 2>/dev/null; then
    echo "  [x] /api/config nao devolveu JSON valido:"
    echo "      $cfg"
    return 1
  fi
  echo "  [ok] Autenticado, /api/config respondeu"
  echo
  echo "Eixo ativo agora:"
  echo "$cfg" | bonito | sed 's/^/  /'
  echo
  echo "Lembre na hora do ao vivo:"
  echo "  - currentConfig e' estado em memoria (server.js:43). Reiniciou o"
  echo "    servidor, o eixo volta pra v1 + claude-sonnet-5 em silencio."
  echo "  - Langfuse tem ~45s de lag entre exportar e ficar consultavel (§11.2)."
  echo "    Nao abra a trace no segundo seguinte ao POST."
}

cmd_eixo() {
  local pv="${1:-}" mdl="${2:-}"

  if [ -z "$pv" ] && [ -z "$mdl" ]; then
    eco_curl -s "${AUTH[@]}" "$BASE/api/config"
    curl -s "${AUTH[@]}" "$BASE/api/config" | bonito
    return
  fi

  local body="{" primeiro=1
  if [ -n "$pv" ]; then
    if [ "$pv" != "v1" ] && [ "$pv" != "v2" ]; then
      echo "Versao de prompt invalida: '$pv' (use v1 ou v2)." >&2; return 1
    fi
    body="$body\"promptVersion\":\"$pv\""; primeiro=0
  fi
  if [ -n "$mdl" ]; then
    local real; real=$(modelo_real "$mdl")
    if [ "$real" = "__invalido__" ]; then
      echo "Modelo invalido: '$mdl' (use sonnet, haiku ou opus)." >&2; return 1
    fi
    [ $primeiro -eq 0 ] && body="$body,"
    body="$body\"model\":\"$real\""
  fi
  body="$body}"

  # server.js:54 ignora campo invalido em SILENCIO e devolve 200 com a config
  # antiga. Por isso este script sempre imprime a resposta: o que voltou e' a
  # verdade, nao o que voce mandou.
  eco_curl -s -X POST "$BASE/api/config" -H 'Content-Type: application/json' -d "$body" "${AUTH[@]}"
  curl -s -X POST "$BASE/api/config" -H 'Content-Type: application/json' -d "$body" "${AUTH[@]}" | bonito
}

cmd_sugerir() {
  local texto="${1:-O que eu faco pro jantar hoje?}"

  echo "Eixo ativo:"
  curl -s "${AUTH[@]}" "$BASE/api/config" | bonito | sed 's/^/  /'

  local body resp code corpo
  body=$(node -e 'process.stdout.write(JSON.stringify({promptText:process.argv[1]}))' "$texto")

  eco_curl -s -X POST "$BASE/api/sugestao" -H 'Content-Type: application/json' -d "$body" "${AUTH[@]}"

  resp=$(curl -s -w $'\n%{http_code}' -X POST "$BASE/api/sugestao" \
    -H 'Content-Type: application/json' -d "$body" "${AUTH[@]}")
  code=$(printf '%s' "$resp" | tail -1)
  corpo=$(printf '%s' "$resp" | sed '$d')

  echo "HTTP $code"
  echo "$corpo" | bonito

  if [ "$code" = "500" ] && printf '%s' "$corpo" | grep -q 'tool_use'; then
    echo
    echo "  >>> Esse e' o achado §11.4 reproduzido."
    echo "      A Anthropic devolveu 400 ('tool_use ids were found without"
    echo "      tool_result blocks'), mas o catch em server.js:250 reembrulha"
    echo "      tudo como 500 — por isso a tela mostra 500, nao 400."
    echo "      Causa raiz: max_tokens=1024 (agent.js:42) cortou a resposta no"
    echo "      meio do tool_use; stop_reason virou 'max_tokens', o loop deu"
    echo "      break (agent.js:65) sem processar o bloco, e o tool_choice"
    echo "      forcado (agent.js:108) empilhou mensagem numa conversa ja"
    echo "      inconsistente."
  fi

  local tid
  tid=$(printf '%s' "$corpo" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(j.trace_id||"")}catch(e){}})')
  if [ -n "$tid" ]; then
    echo
    cmd_trace "$tid"
  fi
}

cmd_reproduzir() {
  echo "=== Reproducao deliberada do achado §11.4 ==="
  echo "Nao e' bug a corrigir — e' conteudo de aula preservado por decisao"
  echo "explicita (CLAUDE.md, 'Achados reais preservados')."
  echo
  echo "Passo 1/2 — colocar o eixo em v2 (o prompt que manda registrar consumo):"
  cmd_eixo v2 sonnet
  echo
  echo "Passo 2/2 — pedir uma receita longa o bastante pra estourar 1024 tokens:"
  cmd_sugerir "Monte um jantar completo usando o maximo possivel do que tem na despensa hoje, com passo a passo bem detalhado de cada etapa e as quantidades exatas de cada ingrediente."
  echo
  echo "Se nao estourou desta vez: o truncamento depende do tamanho da resposta,"
  echo "nao e' deterministico. Rode de novo ou peca algo ainda mais longo."
  echo "Pra confirmar no Langfuse: output tokens da generation == 1024 e'"
  echo "assinatura de teto, nao de outra falha (§11.4)."
}

cmd_trace() {
  local tid="${1:-}"
  [ -z "$tid" ] && { echo "uso: $0 trace <traceId>" >&2; return 1; }
  echo "traceId: $tid"
  if [ -n "$LANGFUSE_PROJECT_ID" ]; then
    echo "Langfuse: ${LANGFUSE_BASE_URL%/}/project/$LANGFUSE_PROJECT_ID/traces/$tid"
  else
    echo "Langfuse: ${LANGFUSE_BASE_URL%/} -> cole o traceId na busca de traces."
    echo "  (defina LANGFUSE_PROJECT_ID no topo do script pra virar link direto)"
  fi
  echo "Espere ~45s depois do POST antes de abrir — lag de ingestao (§11.2)."
}

case "${1:-preflight}" in
  preflight) cmd_preflight ;;
  eixo)      shift; cmd_eixo "${1:-}" "${2:-}" ;;
  sugerir)   shift; cmd_sugerir "${1:-}" ;;
  reproduzir) cmd_reproduzir ;;
  trace)     shift; cmd_trace "${1:-}" ;;
  *) sed -n '2,18p' "$0" ;;
esac
