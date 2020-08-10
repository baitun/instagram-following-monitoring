import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/index.js',
  output: {
    format: 'iife',
    file: './dist/dist.js',
    indent: false
  },
  plugins: [terser()]
};
