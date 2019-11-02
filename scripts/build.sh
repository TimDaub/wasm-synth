#!/usr/bin/env bash

DIR=".wasm"

if [ ! -d $DIR ]; then
  mkdir $DIR
fi

emcc --bind src/cpp/main.cpp -s WASM=1 -o $DIR/main.js
