# wasm-synth

> A synthesizer built from scratch in C++ and made available on the web
> through WebAssembly.

## Prerequisites

The following tools are required for spinning up a local instance of WASM
SYNTH. Click on the links to view the installation manuals:

- [emscripten](https://emscripten.org/docs/getting_started/downloads.html) (`emcc version 1.39.0`)
- [rollupjs](https://rollupjs.org/guide/en/)

## Docs & Blog post

My previous goal with this project was to learn audio programming. I wrote
about it in [this blog post](https://timdaub.github.io/2020/02/19/wasm-synth/).
Since until then, a [cambrian
explosion](https://en.wikipedia.org/w/index.php?title=Cambrian_explosion&oldid=952135228)
of webassembly-based browser languages have appeared, I'm currently trying to
make WASM SYNTH work properly again.

## Compatibility

Since it seems that many browsers-vendors are arbitrarily changing APIs these
days, I'm gonna keep track of WASM SYNTHs compatability here.

|Commit|Chrome|Firefox|Safari|Brave|
|---|---|---|---|---|
c4379418bc1cfe116dbf6bc51e25a42fdaa9c6f3|✓ 81.0|✓ 76.0|✗ 13.0.4|✓ 1.8.86|

### How are we currently testing?

- `npm run dev` and open the displayed site in one of the above browsers
- Hit some notes on your keyboard or by pressing with the mouse
- Toggle some UI elements (e.g. toggle off an oscillator)

### I know how to improve/automate testing!

That's great! Any feedback or help is welcome! Please get in touch!

## Install

To install:

```
$ npm i
```

## Run

Before running the below specified commands, you'll have to set emsdk's
environment variable as is detailed on the above linked page.

For development:

``` $ npm run dev ```

To build:

``` $ npm run build ```

## License

See [License](./LICENSE).

## Third Party resources Licenses

- Caret from [Freepik](https://www.flaticon.com/de/autoren/freepik) from [Flaticon](https://www.flaticon.com)
