#!/usr/bin/env bash
set -eu

if [ "$#" -ne 3 ]; then
  echo "usage: $0 /path/to/apktool.jar /path/to/zipalign /path/to/apksigner.jar" >&2
  exit 2
fi

project_root_directory=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
apktool_project_directory="$project_root_directory/app/src/main"
build_output_directory="$project_root_directory/build"
apktool_jar_path="$1"
zipalign_path="$2"
apksigner_jar_path="$3"
unsigned_apk_path="$build_output_directory/Toki-Pona-Drills-v1.0.1-unsigned.apk"
aligned_apk_path="$build_output_directory/Toki-Pona-Drills-v1.0.1-aligned.apk"
signed_apk_path="$build_output_directory/Toki-Pona-Drills-v1.0.1.apk"
signing_key_path="${TOKI_PONA_SIGNING_KEY_PATH:-$build_output_directory/Toki-Pona-Drills-update-key.p12}"
signing_key_password="${TOKI_PONA_SIGNING_KEY_PASSWORD:-toki-pona-v1-offline}"
signing_key_alias="toki-pona-drills"
apktool_framework_directory="$build_output_directory/apktool-framework"

mkdir -p "$build_output_directory"
mkdir -p "$apktool_framework_directory"

if [ ! -f "$signing_key_path" ]; then
  keytool -genkeypair \
    -keystore "$signing_key_path" \
    -storetype PKCS12 \
    -storepass "$signing_key_password" \
    -keypass "$signing_key_password" \
    -alias "$signing_key_alias" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 36500 \
    -dname "CN=Toki Pona Drills, OU=Offline Trainer, O=Private Build, C=US" \
    -noprompt
fi

java -jar "$apktool_jar_path" build \
  "$apktool_project_directory" \
  --force \
  --frame-path "$apktool_framework_directory" \
  --output "$unsigned_apk_path"

"$zipalign_path" -P 16 -f -v 4 \
  "$unsigned_apk_path" \
  "$aligned_apk_path"

"$zipalign_path" -c -P 16 -v 4 "$aligned_apk_path"

java -jar "$apksigner_jar_path" sign \
  --ks "$signing_key_path" \
  --ks-type PKCS12 \
  --ks-key-alias "$signing_key_alias" \
  --ks-pass "pass:$signing_key_password" \
  --key-pass "pass:$signing_key_password" \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --v3-signing-enabled true \
  --v4-signing-enabled false \
  --out "$signed_apk_path" \
  "$aligned_apk_path"

java -jar "$apksigner_jar_path" verify \
  --verbose \
  --print-certs \
  --min-sdk-version 23 \
  --max-sdk-version 35 \
  "$signed_apk_path"

echo "$signed_apk_path"
