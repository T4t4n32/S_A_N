#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [ ! -d android ]; then
  echo "Todavía no existe la carpeta android."
  echo "Ejecuta primero: ./construir-apk.sh"
  exit 1
fi

if [ -x "/usr/local/android-studio/bin/studio" ]; then
  exec "/usr/local/android-studio/bin/studio" "$ROOT/android"
elif [ -x "/usr/local/android-studio/bin/studio.sh" ]; then
  exec "/usr/local/android-studio/bin/studio.sh" "$ROOT/android"
elif [ -x "/opt/android-studio/bin/studio" ]; then
  exec "/opt/android-studio/bin/studio" "$ROOT/android"
elif command -v android-studio >/dev/null 2>&1; then
  exec android-studio "$ROOT/android"
else
  npx cap open android
fi
