/**
 * @file
 * Babel config.
 */

module.exports = {
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
  env: {
    test: {
      presets: [['@babel/preset-env']],
    },
    module: {
      presets: [['@babel/preset-env', {
        bugfixes: true,
        useBuiltIns: 'usage',
        corejs: '3',
        modules: false,
        shippedProposals: true,
      }]],
    }
  },
};
