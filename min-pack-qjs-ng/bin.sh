#!/usr/bin/env bash
set -e
OS="$(uname -s)"
ARCH="$(uname -m)"
DIR="$(dirname "$(realpath "$0")")"
if [[ "$OS" == "Linux" && "$ARCH" == "x86_64" ]]; then exec "$DIR/qjs-linux-x86_64" "$@"
elif [[ "$OS" == "Linux" && "$ARCH" == "aarch64" ]]; then exec "$DIR/qjs-linux-aarch64" "$@"
else echo "no binary for $OS-$ARCH" >&2; exit 1
fi
