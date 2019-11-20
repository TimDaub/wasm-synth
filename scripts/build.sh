#!/usr/bin/env bash

DIR=".wasm"

if [ ! -d $DIR ]; then
  mkdir $DIR
fi

# NOTE `-std`: To use modern c++11 features like std::tuple and std::vector,
# we need to enable C++ 11 by passing the parameter to gcc through emcc.
emcc src/cpp/*.cc \
  -std=c++11 \
  -O1 \
  -s WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s BINARYEN_ASYNC_COMPILATION=0 \
  -s SINGLE_FILE=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  --bind \
  -o $DIR/main.js

cp $DIR/main.js public/bundle-wasm.js
