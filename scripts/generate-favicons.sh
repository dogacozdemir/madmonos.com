#!/usr/bin/env bash
# Regenerate square favicons from public/madmonos.webp (center crop, lanczos scale).
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="public/madmonos.webp"
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$SRC")
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$SRC")
S=$(( W < H ? W : H ))
Y=$(( (H - S) / 2 ))
X=$(( (W - S) / 2 ))
VF="crop=${S}:${S}:${X}:${Y},scale=%d:%d:flags=lanczos"
ffmpeg -y -i "$SRC" -vf "$(printf "$VF" 32 32)" -frames:v 1 public/favicon-32.png
ffmpeg -y -i "$SRC" -vf "$(printf "$VF" 48 48)" -frames:v 1 public/favicon-48.png
ffmpeg -y -i "$SRC" -vf "$(printf "$VF" 192 192)" -frames:v 1 public/favicon-192.png
ffmpeg -y -i "$SRC" -vf "$(printf "$VF" 180 180)" -frames:v 1 public/apple-touch-icon.png
ffmpeg -y -i public/favicon-32.png -frames:v 1 public/favicon.ico
