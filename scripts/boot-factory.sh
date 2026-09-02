#!/bin/bash
# Start Postgres + Next + Cloudflare tunnel, then re-point Meta at the live URL.
# Safe to re-run. Does not send to restaurants.
set -euo pipefail
export PATH="/usr/bin:/bin:/opt/homebrew/bin:/usr/local/bin:/Applications/Docker.app/Contents/Resources/bin:${HOME}/.nvm/versions/node/v22.22.2/bin:${PATH}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LOGDIR="${ROOT}/.factory-logs"
mkdir -p "$LOGDIR"

echo "== 1. Postgres (Docker) =="
docker compose up -d
for i in $(seq 1 30); do
  if docker exec babyrock-proto-pg pg_isready -U babyrock -d babyrock >/dev/null 2>&1; then
    echo "Postgres ready"
    break
  fi
  sleep 1
done

echo "== 2. Next.js :3001 =="
if curl -sf --max-time 2 "http://127.0.0.1:3001/api/health" >/dev/null; then
  echo "Next already up"
else
  nohup npm run dev -- -p 3001 >"${LOGDIR}/next.log" 2>&1 &
  echo $! >"${LOGDIR}/next.pid"
  for i in $(seq 1 40); do
    if curl -sf --max-time 2 "http://127.0.0.1:3001/api/health" >/dev/null; then
      echo "Next ready"
      break
    fi
    sleep 1
  done
fi
curl -sf --max-time 5 "http://127.0.0.1:3001/api/health" >/dev/null || {
  echo "Next failed to start. See ${LOGDIR}/next.log"
  exit 1
}

echo "== 3. Public tunnel =="
if [[ -f .tunnel-url ]]; then
  OLD="$(tr -d '[:space:]' <.tunnel-url)"
  if curl -sf --max-time 8 "${OLD}/api/health" >/dev/null; then
    echo "Tunnel still live: ${OLD}"
  else
    rm -f .tunnel-url
  fi
fi
if [[ ! -f .tunnel-url ]]; then
  : >"${LOGDIR}/cloudflared.log"
  nohup cloudflared tunnel --url http://localhost:3001 >"${LOGDIR}/cloudflared.log" 2>&1 &
  echo $! >"${LOGDIR}/cloudflared.pid"
  URL=""
  for i in $(seq 1 40); do
    URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "${LOGDIR}/cloudflared.log" | head -1 || true)"
    if [[ -n "${URL}" ]]; then
      echo "${URL}" >.tunnel-url
      echo "Tunnel: ${URL}"
      break
    fi
    sleep 1
  done
  [[ -n "${URL}" ]] || { echo "cloudflared did not print a URL"; exit 1; }
fi

echo "== 4. Meta webhook override =="
npx tsx scripts/register-whatsapp-webhook.ts
echo "Factory up. Keep this Mac awake for WhatsApp. Meta callback is the URL in .tunnel-url"
