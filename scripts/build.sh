#!/usr/bin/env bash

DIR=".wasm"

if [ ! -d $DIR ]; then
  mkdir $DIR
fi

# NOTE `-std`: To use modern c++11 features like std::tuple and std::vector,
# we need to enable C++ 11 by passing the parameter to gcc through emcc.
emcc src/cpp/*.cc \
  -std=c++11 \
  -s WASM=1 \
  --bind \
  -lopenal \
  -o $DIR/main.js
