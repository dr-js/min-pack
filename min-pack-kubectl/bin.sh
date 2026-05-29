#!/usr/bin/env bash

OS="$(uname -s)"
ARCH="$(uname -m)"
DIR="$(dirname "$(realpath "$0")")"

if [[ "$OS" == "Linux" && "$ARCH" == "x86_64" ]]; then
  if [[ -f "$DIR/../kubectl-linux-x64/kubectl" ]]; then exec "$DIR/../kubectl-linux-x64/kubectl" "$@"
  else exec "$DIR/node_modules/@min-pack/kubectl-linux-x64/kubectl" "$@"
  fi
elif [[ "$OS" == "Linux" && "$ARCH" == "aarch64" ]]; then
  if [[ -f "$DIR/../kubectl-linux-arm64/kubectl" ]]; then exec "$DIR/../kubectl-linux-arm64/kubectl" "$@"
  else exec "$DIR/node_modules/@min-pack/kubectl-linux-arm64/kubectl" "$@"
  fi
else echo "no binary for $OS-$ARCH" >&2; exit 1
fi
