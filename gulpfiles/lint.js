/**
 * @file
 * Lints CSS and JS.
 */

'use strict';

import gulp from 'gulp';
import sassLint from 'gulp-sass-lint';
import eslint from 'gulp-eslint';

import config from './config';

// The actual files to lint (or ignore).
let lintFiles = {
  js: config.jsFiles,

  sass: [
    config.sass.src + '/**/*.scss'
  ]
};

let esLintOptions = {
  useEslintrc: false,
  configFile: './.eslintrc.json'
}

/**
 * Lint JS.
 */
const js = function() {
  return gulp.src(lintFiles.js)
    .pipe(eslint(esLintOptions))
    .pipe(eslint.format());
};

js.description = 'Lints all JS src files.';
gulp.task('lint:js', js);

/**
 * Lint JS (with fail).
 */
const jsWithFail = function() {
  return gulp.src(lintFiles.js)
    .pipe(eslint(esLintOptions))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
};

jsWithFail.description = 'Lints all JS src files, and fail on an error.';
gulp.task('lint:js-with-fail', jsWithFail);

/**
 * Lint Sass.
 */
const sass = function() {
  return gulp.src(lintFiles.sass)
    .pipe(sassLint())
    .pipe(sassLint.format());
};

sass.description = 'Lints all Sass src files.';
gulp.task('lint:sass', sass);

/**
 * Lint Sass (with fail).
 */
const sassWithFail = function() {
  return gulp.src(lintFiles.sass)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
};

sassWithFail.description = 'Lints all Sass src files, and fail on an error.';
gulp.task('lint:sass-with-fail', sassWithFail);

/**
 * Run both linters in series.
 */
const lint = gulp.series('lint:sass', 'lint:js');
lint.description = 'Lint Sass and JS.';
gulp.task('lint', lint);

/**
 * Run both linters in series (with fail).
 */
const lintWithFail = gulp.series('lint:sass-with-fail', 'lint:js-with-fail');
lintWithFail.description = 'Lint Sass and JS, and fail on an error.';
gulp.task('lint:with-fail', lintWithFail);

// Export all functions.
export { js, jsWithFail, sass, sassWithFail, lint, lintWithFail };
