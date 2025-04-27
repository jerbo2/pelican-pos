#!/bin/bash
set -e

# i.e. bash build_push.sh Dockerfile.fastapi jerb02/fastapi-pos-app:latest Dockerfile.react-prod jerb02/react-pos-app:latest

if (( $# % 2 != 0 || $# == 0 )); then
  echo "Error: Must provide pairs of <path> <image_name:tag>"
  echo "Usage: $0 <path1> <image1:tag> [<path2> <image2:tag> ...]"
  exit 1
fi

while [[ $# -gt 0 ]]; do
  DOCKERFILE_DIR="$1"
  IMAGE_NAME="$2"

  echo "Building image: $IMAGE_NAME from $DOCKERFILE_DIR"
  docker build -f "$DOCKERFILE_DIR" -t "$IMAGE_NAME" .

  echo "Pushing image: $IMAGE_NAME"
  docker push "$IMAGE_NAME"

  shift 2
done