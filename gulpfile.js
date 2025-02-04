/**
 * @file
 * Handles importing gulpfile.yml and sets up global config.
 */

'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const bulkSass = require('gulp-sass-glob-use-forward');
const eyeglass = require('eyeglass');


function compileSass() {
    return gulp.src('styles/**/*.scss')
        .pipe(bulkSass())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('assets'));
}

gulp.task('sass', compileSass);

gulp.task('watch', function() {
    gulp.watch('styles/**/*.scss', gulp.series('sass'));
});