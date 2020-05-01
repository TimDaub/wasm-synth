// @format
import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";
import postcss from "rollup-plugin-postcss";
import url from "@rollup/plugin-url";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

module.exports = [
  {
    input: "src/js/main.js",
    output: {
      dir: "public",
      format: "cjs",
      sourcemap: !production
    },
    plugins: [
      url({
        // by default, rollup-plugin-url will not handle font files
        include: ["**/*.woff", "**/*.woff2", "**/*.png"],
        // setting infinite limit will ensure that the files
        // are always bundled with the code, not copied to /dist
        limit: Infinity
      }),
      postcss({
        extensions: [".css"],
        // NOTE: We don't inject css styles, as that would mess with styles coming
        // from styled-components
        inject: false
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production")
      }),
      babel({
        exclude: "node_modules/**"
      }),
      // NOTE: `main: false` allows npm link'ed packages to be resolved too.
      resolve({ main: false, module: true, browser: true }),
      // NOTE: styled-components won't compile without this configuration of
      // commonjs: https://github.com/styled-components/styled-components/issues/1654#issuecomment-441151140
      commonjs({
        include: "node_modules/**",
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        namedExports: {
          "node_modules/react/index.js": [
            "cloneElement",
            "createContext",
            "Component",
            "createElement"
          ],
          "node_modules/react-dom/index.js": ["render", "hydrate"],
          "node_modules/react-is/index.js": [
            "isElement",
            "isValidElementType",
            "ForwardRef"
          ],
          "node_modules/automation-events/build/es5/bundle.js": [
            "AutomationEventList",
            "createCancelAndHoldAutomationEvent",
            "createCancelScheduledValuesAutomationEvent",
            "createExponentialRampToValueAutomationEvent",
            "createLinearRampToValueAutomationEvent",
            "createSetTargetAutomationEvent",
            "createSetValueAutomationEvent",
            "createSetValueCurveAutomationEvent"
          ]
        }
      }),
      production && terser()
    ]
  }
];
