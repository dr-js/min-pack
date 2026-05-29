#!/usr/bin/env bash

OS="$(uname -s)"
ARCH="$(uname -m)"
DIR="$(dirname "$(realpath "$0")")"

if [[ "$OS" == "Linux" && "$ARCH" == "x86_64" ]]; then exec "$DIR/../kubectl-linux-x64/kubectl" "$@"
elif [[ "$OS" == "Linux" && "$ARCH" == "aarch64" ]]; then exec "$DIR/../kubectl-linux-arm64/kubectl" "$@"
else echo "no binary for $OS-$ARCH" >&2; exit 1
fi
