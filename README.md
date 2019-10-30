# wasm-synth

> A synthesizer built from scratch in C++ and made available on the web through
> WebAssembly.

## Requirements

- Have
  [emscripten](https://emscripten.org/docs/getting_started/downloads.html)
  installed and activated in your shell.

## Run

To compile and bundle everything and start a web server, use the following
command.

```
$ emcc --bind src/main.cpp -s WASM=1 -o dist/wasm/main.js && cp -a public/. dist/ && python -m SimpleHTTPServer 8000
```

## License

MIT
