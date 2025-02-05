/**
 * @file
 * Watch task runners.
 */

'use strict';

import gulp from 'gulp';

import config from './config';
import * as styles from './styles';
import * as clean from './clean';

// Files to watch for changes.
let watchFiles = {
  sass: [
    config.sass.src + '/**/*.scss',
  ],
}

// Watch options.
let watchOptions = {
  usePolling: false
}

/**
 * Watch sass files.
 *
 * Rather than doing a full reload of browserSync, the sass watcher will inject
 * CSS (see styles:development inside styles.js). This is a compromise
 * so you can get instant soft-refreshes to see changes to CSS rapidly. However
 * if you make changes to styleguide comments inside a sass file, browserSync
 * won't automatically reload even though the html has changed. You'll need
 * to manually reload in those cases.
 */
const sass = function(e) {
  gulp.watch(watchFiles.sass, watchOptions, gulp.series('styles:development'));
}

sass.description = 'Watch scss files and rebuild styles and the styleguide, with linting.';
gulp.task('watch:sass', sass);

// Export all functions.
export { sass };
