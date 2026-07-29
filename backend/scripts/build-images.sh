#!/bin/bash
# Builds the Docker images that dockerRunner.js uses to execute code.
# Run this once before starting the server (and again if you edit a Dockerfile).
set -e

cd "$(dirname "$0")/.."

echo "Building codeforge-python..."
docker build -t codeforge-python ./docker/python

echo "Building codeforge-node..."
docker build -t codeforge-node ./docker/node

echo "Building codeforge-java..."
docker build -t codeforge-java ./docker/java

echo "All images built. Run 'docker images | grep codeforge' to verify."
