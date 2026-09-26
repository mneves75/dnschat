#!/bin/bash
# sheet.sh out.png t1 t2 t3 t4 -> 2x2 contact sheet of stills/t-<t>.png at half size
out=$1; shift; args=(); fc=""; j=0
for t in "$@"; do args+=(-i "stills/t-$t.png"); fc+="[$j:v]scale=960:540[v$j];"; j=$((j+1)); done
ffmpeg -y -loglevel error "${args[@]}" -filter_complex "${fc}[v0][v1]hstack[a];[v2][v3]hstack[b];[a][b]vstack" "$out"
