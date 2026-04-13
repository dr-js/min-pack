#!/usr/bin/env bash

OS="$(uname -s)"
ARCH="$(uname -m)"
DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ "$OS" == "Linux" && "$ARCH" == "x86_64" ]]; then exec "$DIR/ssservice-linux-x86_64" "$@"
elif [[ "$OS" == "Linux" && "$ARCH" == "aarch64" ]]; then exec "$DIR/ssservice-linux-aarch64" "$@"
else echo "no binary for $OS-$ARCH" >&2; exit 1
fi
