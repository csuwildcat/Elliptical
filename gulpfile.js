
const fs = require('fs-extra');
const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');
const mergeStreams = require('merge-stream');
const nunjucksRender = require('gulp-nunjucks-render');
const axios = require('axios');

const schemaOrg = require('@postman-open-tech/schemaorgjsonschema');

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

async function compileSchemas() {
  return new Promise(async resolve => {
    const schemaSource = 'node_modules/@postman-open-tech/schemaorgjsonschema/schema';
    const schemaDestination = 'app/assets/schemas/schema.org';
    await fs.ensureDir(schemaDestination);
    try {
      await fs.copy(schemaSource, schemaDestination);
    } catch (err) {
      console.error(err);
    }
    resolve();
  });
};

gulp.task('schemas', compileSchemas);

gulp.task('build', gulp.series(compileCSS, compileJS, renderTemplates));

gulp.task('watch', () => {
  gulp.watch([root + 'js/**/*', '!' + root + 'js/compiled/**/*'], compileJS);
  gulp.watch([root + 'css/**/*', '!' + root + 'css/compiled/**/*'], compileCSS);
  gulp.watch(['templates/**/*'], gulp.parallel(renderTemplates));
});