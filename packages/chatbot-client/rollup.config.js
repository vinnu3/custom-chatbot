import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import path from 'path';

const extensions = ['.js', '.jsx'];

export default {
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
