
const fs = require('fs-extra');
const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');
const mergeStreams = require('merge-stream');
const nunjucksRender = require('gulp-nunjucks-render');
const axios = require('axios');

const $RefParser = require("@apidevtools/json-schema-ref-parser");
const {stringify} = require('flatted');

const root = 'app/assets/';
const compiledJS = root + 'js/compiled/';
const compiledCSS = root + 'css/compiled/';

var assets = {
  js: {
    'web-components': [
      'slide-panels.js',
      'tab-panels.js',
      'render-list.js',
      'modal-overlay.js',
      'detail-box.js',
      'notice-bar.js',
    //  'schema-form.js',
    ].map(name => root + 'js/web-components/' + name),
    body: [
      root + 'js/global.js'
    ]
  },
  css: {
    'head': [
      root + 'css/view.css',
      root + 'css/font-awesome.css'
    ],
    'web-components': [
      'slide-panels.css',
      'modal-overlay.css',
      'tab-panels.css',
      'detail-box.css',
      'notice-bar.css',   
      'item-lists.css',
     // 'schema-form.css',
    ].map(name => root + 'css/web-components/' + name),
  }
};

async function compileJS(){
  return new Promise(async resolve => {
    await fs.ensureDir(compiledJS);
    mergeStreams(
      ...Object.keys(assets.js).map(file => {
        return gulp.src(assets.js[file])
                   .pipe(terser())
                   .pipe(concat(file + '.js'))
                   .pipe(gulp.dest(compiledJS))
      })
    ).on('finish', () => resolve())
  });
}

async function compileCSS(){
  return new Promise(async resolve => {
    await fs.ensureDir(compiledCSS);
    mergeStreams(
      ...Object.keys(assets.css).map(file => {
        return gulp.src(assets.css[file])
                   .pipe(cleanCSS())
                   .pipe(concat(file + '.css'))
                   .pipe(gulp.dest(compiledCSS))
      })
    ).on('finish', () => resolve())
  });
}

async function renderTemplates() {
  return gulp.src('templates/pages/**/*.html')
    .pipe(nunjucksRender({
      path: ['templates', 'templates/partials', 'templates/pages'],
      data: {
        
      }
    }))
    .pipe(gulp.dest('./app/'))
};


const schemaSource = 'node_modules/@postman-open-tech/schemaorgjsonschema/schema';
const schemaDestination = 'app/assets/schemas/schema.org';

async function copySchemas() {
  return new Promise(async resolve => {
    
    await fs.ensureDir('app/assets/schemas/schema.org');

    try {
      const sourceFiles = await fs.readdir(schemaSource);
      for (const file of sourceFiles) {
        let text = await fs.readFile(schemaSource + '/' + file, 'utf8');
        let modified = text.replace(/"\$ref":\s+"(\w)/gmi, function(match, g){
          return '"$ref": "/repos/carbon/app/assets/schemas/schema.org/' + g;
        });
        await fs.writeFile(schemaDestination + '/' + file, modified);
      }
      resolve();

    } catch (err) {
      console.error(err);
      resolve();
    }

  });
};

async function compileSchemas() {
  return new Promise(async resolve => {

    try {

      let done;
      const destinationFiles = await fs.readdir(schemaDestination);
      for (const file of destinationFiles) {
        let path = schemaDestination + '/' + file;
        let schema;
        try {
          let json = await fs.readJson(path, 'utf8');
          schema = await $RefParser.dereference(json);
          await fs.writeFile(path, stringify(schema));
        }
        catch (e) {
          console.log(e);
          if (!done) {
            done = true;
            console.log(e);
            console.log(schema);
          }
          fs.remove(path);
        }
      }

      resolve();

    } catch (err) {
      console.error(err);
      resolve();
    }
  });
};

gulp.task('schemas', gulp.series(copySchemas, compileSchemas));

gulp.task('build', gulp.series(compileCSS, compileJS, renderTemplates));

gulp.task('watch', () => {
  gulp.watch([root + 'js/**/*', '!' + root + 'js/compiled/**/*'], compileJS);
  gulp.watch([root + 'css/**/*', '!' + root + 'css/compiled/**/*'], compileCSS);
  gulp.watch(['templates/**/*'], gulp.parallel(renderTemplates));
});