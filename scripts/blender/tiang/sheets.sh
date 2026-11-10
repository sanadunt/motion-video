#!/bin/zsh
# Lembar storyboard + overlay safe zone untuk ArsipTiang (still skala 0,5: 540×960).
D="${1:-out/review/ArsipTiangStoryboard-Portrait}"
N=${2:-12}
in=(); for i in $(seq 1 $N); do in+=(-i "$D/scene-$i.png"); done
ffmpeg -v error -y "${in[@]}" -filter_complex "$(for i in $(seq 0 $((N-1))); do printf "[%d]scale=360:640[s%d];" $i $i; done)$(for i in $(seq 0 $((N-1))); do printf "[s%d]" $i; done)xstack=inputs=${N}:grid=6x2" "$D/storyboard-contact.png"
box="drawbox=x=30:y=190:w=450:h=580:color=yellow@0.9:t=3,drawbox=x=30:y=632:w=450:h=108:color=blue@0.8:t=3,drawbox=x=480:y=0:w=60:h=960:color=red@0.35:t=fill,drawbox=x=0:y=0:w=540:h=190:color=red@0.25:t=fill,drawbox=x=0:y=770:w=540:h=190:color=red@0.25:t=fill"
ffmpeg -v error -y "${in[@]}" -filter_complex "$(for i in $(seq 0 $((N-1))); do printf "[%d]%s,scale=360:640[s%d];" $i "$box" $i; done)$(for i in $(seq 0 $((N-1))); do printf "[s%d]" $i; done)xstack=inputs=${N}:grid=6x2" "$D/safezone-sheet.png"
