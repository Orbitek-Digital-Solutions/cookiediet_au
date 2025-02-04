/**
 * @file
 * Handles importing gulpfile.yml and sets up global config.
 */

'use strict';

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const sass = require('gulp-sass')(require('node-sass'));


let config = {};
try {
  // At this stage we are only using one gulpfile.yml.
  // If the need arrises to have developer overrides for gulp config we can do this.
  config = yaml.load(fs.readFileSync('gulpfile.yml', 'utf8'), {json: true});
} catch (e) {
  console.log('gulpfile.yml not found!');
}

// node-sass / eyeglass global config.
// This is used by styles and styleguide.
config.sassOptions = {
  includePaths: [
    config.sass.src
  ],
  // We are using the standard expanded style for outputting all CSS.
  outputStyle: 'expanded',
  eyeglass: {
    // This is a little hacky and not entirely great however it's the best we
    // can do with the current asset management in eyeglass. All assets will get
    // an absolute path prefixed to them.
    httpRoot: '/' + path.relative(config.httpRoot, config.sass.src),
    assets: {
      // Add assets except for js, sass, and twig files.
      // The url passed to the sass asset-url() function should be relative to this directory.
      sources: [
        { directory: config.sass.src, globOpts: { ignore: ['**/*.js', '**/*.scss', '**/*.twig'] }}
      ]
    }
  }
};

// We want to watch/lint all the js files provided in gulpfile.yml.
let jsSrc = [
  ...config.js.src
];
// Create a new array to exclude any files that might already be minified.
let jsMin = jsSrc.map(f => '!' + f + '/**/*.min.js');
// Now we can add the js files glob into the original array.
jsSrc = jsSrc.map(f => f + '/**/*.js');

// Combine the jsSrc and jsMin arrays to give us the full list of js files
// to lint and minified files to ignore.
config.jsFiles = [
  ...jsSrc,
  ...jsMin,
  '!**/vendor/**/*.js',
  '!**/components/responsive-iframe/jquery.responsiveiframe.js'
];

export default config;
