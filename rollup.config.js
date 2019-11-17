// @format
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";
import css from "rollup-plugin-css-porter";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

module.exports = [
  {
    input: "src/js/main.js",
    output: {
      file: "public/bundle.js",
      format: "iife",
      sourcemap: !production
    },
    plugins: [
      replace({
        "process.env.NODE_ENV": JSON.stringify("production")
      }),
      babel({
        exclude: "node_modules/**"
      }),
      resolve({ browser: true }),
      commonjs(),
      css({ minified: production }),
      production && terser()
    ]
  }
];
