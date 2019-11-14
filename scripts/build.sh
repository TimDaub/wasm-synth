#!/usr/bin/env bash

DIR=".wasm"

if [ ! -d $DIR ]; then
  mkdir $DIR
fi

# NOTE `-std`: To use modern c++11 features like std::tuple and std::vector,
# we need to enable C++ 11 by passing the parameter to gcc through emcc.
# NOTE on `EXPORT_ALL` and `LINKABLE`:
# https://stackoverflow.com/a/33208675/1263876
emcc src/cpp/main.cc \
  -std=c++11 \
  -s WASM=1 \
  -s LINKABLE=1 \
  -s EXPORT_ALL=1 \
  -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
  -lopenal \
  -o $DIR/main.js
