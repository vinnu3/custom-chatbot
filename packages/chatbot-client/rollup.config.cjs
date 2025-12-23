const path = require('path');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const postcss = require('rollup-plugin-postcss');

const extensions = ['.js', '.jsx'];

module.exports = {
  input: path.resolve(__dirname, 'src', 'index.jsx'),
  output: [
    {
      file: path.resolve(__dirname, 'dist', 'index.esm.js'),
      format: 'es',
      sourcemap: true
    },
    {
      file: path.resolve(__dirname, 'dist', 'index.cjs.js'),
      format: 'cjs',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({ extensions }),
    commonjs(),
    postcss({
      extract: path.resolve(__dirname, 'dist', 'styles.css'),
      minimize: true,
      plugins: [require('autoprefixer')]
    }),
    babel({
      babelHelpers: 'bundled',
      extensions,
      exclude: 'node_modules/**'
    }),
    terser()
  ],
  external: ['react', 'react-dom']
};
