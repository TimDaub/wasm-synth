#!/usr/bin/env bash

DIR="build"
FILE="src/cpp/oscillator.cc"

if [ ! -d $DIR ]; then
    mkdir $DIR
    npm run -- autogypi --init-gyp -r build -p nbind -s $FILE
fi

# Build wasm and nbind.js file
npm run -- node-gyp -C build configure build --asmjs=1
copyasm build/build public
mv build/build/Release/nbind.wasm public/nbind.wasm
