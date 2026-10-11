#!/bin/bash

echo "Waiting for local Ollama instance..."
# Loop until the tags endpoint returns a 200 OK (meaning server is up)
until curl -s -f http://localhost:11434/api/tags > /dev/null; do
    sleep 2
done
echo "Ollama is ready!"

echo "Pulling Phi-3 (3.8B)..."
docker exec -it $(docker ps -qf "name=ollama") ollama pull phi3
