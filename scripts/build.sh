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
  -s WASM_ASYNC_COMPILATION=0 \
  -s SINGLE_FILE=1 \
  -s MODULARIZE=1 \
  --bind \
  -o $DIR/main.js

# NOTE: We concate the emscripten generated js and wasm file with the worklet
# such that we don't have to import it later as an es6 module. This
# achieves better cross-browser compatibility.
mkdir public/worklets
cat $DIR/main.js src/js/worklets/synth.js > public/worklets/synth.js
