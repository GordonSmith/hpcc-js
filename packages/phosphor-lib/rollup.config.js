import resolve from 'rollup-plugin-node-resolve';

export default {
    entry: 'lib/index.js',
    format: 'umd',
    moduleName: "phosphor-lib",
    dest: 'dist/phosphor-lib.js',
    context: "window",
    plugins: [
        resolve()
    ]
};