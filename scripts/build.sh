#!/usr/bin/env bash

DIR=".wasm"

if [ ! -d $DIR ]; then
  mkdir $DIR
fi

emcc src/cpp/main.cpp \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS="['_SinWave']" \
  -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
  -o $DIR/main.js
