/**
 * @file
 * Defines tasks from imported functions.
 */

'use strict';

import gulp from 'gulp';

import config from './gulpfiles/config';
import * as styles from './gulpfiles/styles';
import * as clean from './gulpfiles/clean';
import * as watch from './gulpfiles/watch';

/**
 * Build for production and fail on a linting error.
 */
const build = gulp.series('styles:production');
build.description = 'Build all styles and styleguide (for production).';
gulp.task('build', build);

// Set the default task to build.
gulp.task('default', gulp.series('watch:sass'));
