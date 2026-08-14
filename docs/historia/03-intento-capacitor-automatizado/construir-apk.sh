#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

linea() {
  printf '\n============================================================\n'
}

mensaje() {
  printf '\n%s\n' "$1"
}

fallar() {
  linea
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

linea
echo "CONSTRUCCIÓN AUTOMÁTICA DEL APK DE SAN"
echo "Proyecto: $ROOT"
linea

command -v node >/dev/null 2>&1 || fallar "Node.js no está instalado."
command -v npm >/dev/null 2>&1 || fallar "npm no está instalado."

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  fallar "Se requiere Node.js 20 o superior. Versión detectada: $(node -v)"
fi

echo "Node.js: $(node -v)"
echo "npm:     $(npm -v)"

java_major() {
  local java_bin="$1"
  local version
  version="$("$java_bin" -version 2>&1 | awk -F '"' '/version/ {print $2; exit}')"
  if [[ "$version" == 1.* ]]; then
    echo "$version" | cut -d. -f2
  else
    echo "$version" | cut -d. -f1
  fi
}

JAVA_CANDIDATES=(
  "/usr/local/android-studio/jbr"
  "/opt/android-studio/jbr"
  "$HOME/android-studio/jbr"
  "/snap/android-studio/current/jbr"
  "/snap/android-studio/current/android-studio/jbr"
  "/usr/lib/jvm/java-21-openjdk-amd64"
)

# Agrega automáticamente otras instalaciones de Java 21.
for candidate in /usr/lib/jvm/*21*; do
  JAVA_CANDIDATES+=("$candidate")
done

if [ -n "${JAVA_HOME:-}" ]; then
  JAVA_CANDIDATES+=("$JAVA_HOME")
fi

JAVA_ENCONTRADO=""
for candidate in "${JAVA_CANDIDATES[@]}"; do
  [ -n "$candidate" ] || continue
  if [ -x "$candidate/bin/java" ]; then
    major="$(java_major "$candidate/bin/java" || true)"
    if [ "$major" = "21" ]; then
      JAVA_ENCONTRADO="$candidate"
      break
    fi
  fi
done

if [ -z "$JAVA_ENCONTRADO" ]; then
  fallar "No se encontró Java 21. Instálalo con: sudo apt update && sudo apt install openjdk-21-jdk"
fi

export JAVA_HOME="$JAVA_ENCONTRADO"
export PATH="$JAVA_HOME/bin:$PATH"

echo "JAVA_HOME: $JAVA_HOME"
java -version

SDK_CANDIDATES=()
[ -n "${ANDROID_HOME:-}" ] && SDK_CANDIDATES+=("$ANDROID_HOME")
[ -n "${ANDROID_SDK_ROOT:-}" ] && SDK_CANDIDATES+=("$ANDROID_SDK_ROOT")
SDK_CANDIDATES+=(
  "$HOME/Android/Sdk"
  "$HOME/Android/sdk"
  "/usr/local/android-sdk"
  "/opt/android-sdk"
)

SDK_ENCONTRADO=""
for candidate in "${SDK_CANDIDATES[@]}"; do
  if [ -d "$candidate" ]; then
    SDK_ENCONTRADO="$candidate"
    break
  fi
done

if [ -z "$SDK_ENCONTRADO" ]; then
  fallar "No se encontró el Android SDK. Ábrelo una vez en Android Studio y comprueba que exista $HOME/Android/Sdk."
fi

export ANDROID_HOME="$SDK_ENCONTRADO"
export ANDROID_SDK_ROOT="$SDK_ENCONTRADO"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

echo "ANDROID_HOME: $ANDROID_HOME"

SDKMANAGER=""
for candidate in \
  "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" \
  "$ANDROID_HOME/cmdline-tools/bin/sdkmanager" \
  "$ANDROID_HOME/tools/bin/sdkmanager"; do
  if [ -x "$candidate" ]; then
    SDKMANAGER="$candidate"
    break
  fi
done

if [ -z "$SDKMANAGER" ] && [ -d "$ANDROID_HOME/cmdline-tools" ]; then
  SDKMANAGER="$(find "$ANDROID_HOME/cmdline-tools" -type f -name sdkmanager -perm -u+x 2>/dev/null | head -n 1 || true)"
fi

if [ ! -d "$ANDROID_HOME/platforms/android-35" ]; then
  if [ -n "$SDKMANAGER" ]; then
    mensaje "Instalando automáticamente Android SDK 35..."
    yes | "$SDKMANAGER" --licenses >/dev/null 2>&1 || true
    "$SDKMANAGER" "platform-tools" "platforms;android-35" "build-tools;35.0.0"
  else
    fallar "Falta Android SDK Platform 35. Instálala en Android Studio: Tools > SDK Manager > Android 15 (API 35)."
  fi
fi

mensaje "1/5 Instalando dependencias del proyecto..."
npm install --include=dev --no-audit --no-fund

mensaje "2/5 Preparando el HTML, React, Babel, Tailwind y las fuentes para uso sin conexión..."
npm run build:web

if [ ! -d "$ROOT/android" ]; then
  mensaje "3/5 Creando el proyecto Android..."
  npx cap telemetry off >/dev/null 2>&1 || true
  npx cap add android
else
  mensaje "3/5 El proyecto Android ya existe; se conservará."
fi

mensaje "4/5 Sincronizando los archivos locales con Android..."
npx cap sync android

CONFIG_COPIADA="$ROOT/android/app/src/main/assets/capacitor.config.json"
if [ -f "$CONFIG_COPIADA" ] && grep -qE '"url"[[:space:]]*:[[:space:]]*"https?://localhost' "$CONFIG_COPIADA"; then
  fallar "La configuración Android copiada todavía contiene server.url apuntando a localhost."
fi

HTML_COPIADO="$ROOT/android/app/src/main/assets/public/index.html"
[ -f "$HTML_COPIADO" ] || fallar "Capacitor no copió www/index.html al proyecto Android."

mensaje "5/5 Compilando app-debug.apk..."
cd "$ROOT/android"
chmod +x gradlew
./gradlew --stop >/dev/null 2>&1 || true
./gradlew clean assembleDebug

APK_ORIGEN="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
[ -f "$APK_ORIGEN" ] || fallar "Gradle terminó, pero no se encontró $APK_ORIGEN"

mkdir -p "$ROOT/SALIDA"
cp -f "$APK_ORIGEN" "$ROOT/SALIDA/SAN-debug.apk"

linea
echo "APK CREADO CORRECTAMENTE"
echo
echo "Archivo:"
echo "$ROOT/SALIDA/SAN-debug.apk"
echo
echo "Puedes abrir la carpeta con:"
echo "xdg-open \"$ROOT/SALIDA\""
linea
