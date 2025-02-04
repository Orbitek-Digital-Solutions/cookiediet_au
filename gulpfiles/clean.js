/**
 * @file
 * Handles cleaning various dirs.
 */

'use strict';

import gulp from 'gulp';
import del from 'del';

import config from './config';

// Define the globs to delete (or leave alone).
let cleanFiles = {
  css: [
    config.sass.dest + '/**/*.css',
    config.sass.dest + '/**/*.map',
  ]
}

/**
 * Clean the SASS destination directory, except styleguide styles.
 */
const css = function() {
  return del(cleanFiles.css, { force: true });
};

css.description = 'Clean the SASS destination directory.';
gulp.task('clean:css', css);

// Export all functions.
export { css };
