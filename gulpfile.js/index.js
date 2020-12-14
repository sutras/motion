const fs = require('fs');
const gulp = require('gulp');
const rollup = require('rollup');
const buble = require('@rollup/plugin-buble');
const { minify } = require('terser');
const header = require('./header');

const pkgJson = fs.readFileSync(`${process.cwd()}/package.json`);
const pkgObj = JSON.parse( pkgJson );
const libName = pkgObj.name;

gulp.task('bundleJs', async () => {
    // 打包并转ES5
    let bundle = await rollup.rollup({
        input: './src/main.js',
        plugins: [
            buble()
        ]
    });

    // 添加头部并生成文件
    bundle = await bundle.write({
        file: `./dist/${libName}.js`,
        format: 'umd',
        name: libName,
        banner: header
    });

    // 压缩、添加头部并生成文件
    const minified = await minify(bundle.output[0].code, {
        output: {
            comments: false,
            preamble: header
        }
    });


    fs.writeFileSync(`${process.cwd()}/dist/${libName}.min.js`, minified.code);
});

gulp.task('default', gulp.series(['bundleJs']));