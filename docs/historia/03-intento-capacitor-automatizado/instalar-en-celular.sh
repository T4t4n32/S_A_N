#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APK="$ROOT/SALIDA/SAN-debug.apk"

if [ ! -f "$APK" ]; then
  echo "No existe $APK"
  echo "Primero ejecuta: ./construir-apk.sh"
  exit 1
fi

if ! command -v adb >/dev/null 2>&1; then
  echo "No se encontró adb."
  echo "También puedes copiar SAN-debug.apk manualmente al celular e instalarlo."
  exit 1
fi

echo "Dispositivos detectados:"
adb devices
echo
echo "Instalando o actualizando SAN..."
adb install -r "$APK"
echo "Instalación finalizada."
