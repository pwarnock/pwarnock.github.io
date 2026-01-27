#!/bin/bash
set -e

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop or the docker daemon."
  exit 1
fi

# Check if Jaeger container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^jaeger$"; then
  echo "🔄 Jaeger container exists."
  if docker ps --format '{{.Names}}' | grep -q "^jaeger$"; then
    echo "✅ Jaeger is already running at http://localhost:16686"
    exit 0
  else
    echo "🚀 Starting existing Jaeger container..."
    docker start jaeger
    echo "✅ Jaeger started at http://localhost:16686"
    exit 0
  fi
fi

echo "📦 pulling and starting new Jaeger container..."

# Run Jaeger all-in-one
# Exposes:
# - 16686: Web UI
# - 4317: OTLP gRPC (used by our Go/TS tests)
# - 4318: OTLP HTTP
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 14250:14250 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

echo "✅ Jaeger started successfully!"
echo "📊 Access UI: http://localhost:16686"
echo "🔌 OTLP Endpoint: localhost:4317 (ready for tests)"
