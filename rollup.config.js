import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/main.js',
    output: {
        file: 'build/main.min.js',
        format: 'iife',
        sourcemap: true,
    },
    plugins: [   
        babel({
            exclude: 'node_modules/**'
        }),
        resolve({
            browser: true,
        }),
        commonjs(), 
        uglify(),
    ],
  };