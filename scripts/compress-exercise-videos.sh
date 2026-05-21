#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="public/videos"
OUT_DIR="public/videos-compressed"

mkdir -p "$OUT_DIR"

for f in "$SRC_DIR"/*; do
  if [[ ! -f "$f" ]]; then
    continue
  fi
  filename="$(basename "$f")"
  name="${filename%.*}"
  out="$OUT_DIR/$name.mp4"

  echo "Comprimeren: $filename -> $(basename "$out")"

  ffmpeg -y -i "$f" -vf "scale=1280:-2" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k "$out"

done

echo "Alle videos gecomprimeerd naar $OUT_DIR"
