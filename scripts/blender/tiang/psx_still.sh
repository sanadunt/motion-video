#!/bin/zsh
# Still PSX (sama dengan pipeline video): nearest ×4 → 48 warna → dither Bayer. psx_still.sh <in.png> <out.png> [warna]
ffmpeg -v error -y -i "$1" -filter_complex "scale=iw*4:ih*4:flags=neighbor,split[a][b];[a]palettegen=max_colors=${3:-48}:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" "$2"
