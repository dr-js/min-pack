#!/usr/bin/env bash
set -e
OS="$(uname -s)"
ARCH="$(uname -m)"
DIR="$(dirname "$(realpath "$0")")"
if [[ "$OS" == "Linux" && "$ARCH" == "x86_64" ]]; then
  if [[ -f "$DIR/../sqlc-linux-x64/sqlc" ]]; then exec "$DIR/../sqlc-linux-x64/sqlc" "$@"
  else exec "$DIR/node_modules/@min-pack/sqlc-linux-x64/sqlc" "$@"
  fi
elif [[ "$OS" == "Linux" && "$ARCH" == "aarch64" ]]; then
  if [[ -f "$DIR/../sqlc-linux-arm64/sqlc" ]]; then exec "$DIR/../sqlc-linux-arm64/sqlc" "$@"
  else exec "$DIR/node_modules/@min-pack/sqlc-linux-arm64/sqlc" "$@"
  fi
else echo "no binary for $OS-$ARCH" >&2; exit 1
fi
