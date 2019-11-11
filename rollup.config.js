// @format
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

module.exports = [
  {
    input: ".wasm/main.js",
    output: {
      file: "public/bundle-wasm.js",
      format: "cjs"
    },
    plugins: [
      copy({
        targets: [{ src: ".wasm/*.wasm", dest: "public" }]
      }),
      production && terser()
    ]
  },
  {
    input: "src/js/main.js",
    output: {
      file: "public/bundle.js",
      format: "cjs",
      sourcemap: !production
    },
    plugins: [resolve({ browser: true }), commonjs(), production && terser()]
  }
];
