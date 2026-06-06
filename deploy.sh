#!/bin/bash
set -e

echo "🚀 Deploying Krysalis OS Dashboard..."

docker build -t krysalisos-dashboard:latest .

docker rm -f krysalisos-dashboard 2>/dev/null || true

docker run -d \
  --name krysalisos-dashboard \
  --restart unless-stopped \
  --network ai-ecosystem_default \
  --network-alias agentos-dashboard \
  -p 3737:3000 \
  -e AGENTIC_OS_CONFIG=/app/config/krysalisos.json \
  -e AGENTIC_OS_PIN=5678 \
  --env-file .env.production \
  -v $(pwd)/vaults/krysalisos:/app/vault \
  -v $(pwd)/configs:/app/config \
  -v /var/lib/docker/volumes/agentos_brain/_data:/brain \
  krysalisos-dashboard:latest

echo "✅ Krysalis OS Dashboard is running on port 3737!"
