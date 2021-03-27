import { terser } from "rollup-plugin-terser";

export default {
  input: "./src/index.js",
  output: {
    format: "iife",
    file: "./dist/bookmarklet.js",
    indent: false,
  },
  plugins: [terser()],
};
