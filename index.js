/*!
 * resolve-file <https://github.com/doowb/resolve-file>
 *
 * Copyright (c) 2015, Brian Woodward, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('./utils');

/**
 * Resolve the path to a file located in one of the following places:
 *
 *  - local to the current project (`'./index.js'`)
 *  - absolute (`'/usr/something.rc'`)
 *  - node module "main" file (`'cwd'`)
 *  - specific file inside a node module (`'cwd/LICENSE'`)
 *  - file located in user's home directory (`'~/.npmrc'`)
 *
 * ```js
 * var fp = resolve('./index.js')
 * //=> /path/to/resolve-file/index.js
 * ```
 *
 * @param  {String} `name` Filename to resolve
 * @param  {Object} `options` Additional options to specify `cwd`
 * @return {String} Resolve `filepath` if found
 * @api public
 */

function resolve(name, options) {
  var opts = utils.extend({cwd: process.cwd()}, options);
  var cwd = utils.cwd(opts.cwd);
  var fp;

  var first = name.charAt(0);
  if (first === '.') {
    fp = path.resolve(cwd, name);
    return utils.exists(fp) ? fp : null;
  }

  if (first === '/') {
    fp = path.resolve(name);
    return utils.exists(fp) ? fp : null;
  }

  if (first === '~') {
    fp = utils.expandTilde(name);
    return utils.exists(fp) ? fp : null;
  }

  fp = path.resolve(cwd, name);
  if (utils.exists(fp)) {
    return fp;
  }

  try {
    if (/[\\\/]/.test(name)) {
      var basename = path.basename(name);
      var modulePath = require.resolve(path.dirname(name));
      var filepath = path.resolve(path.dirname(modulePath), basename);
      if (utils.exists(filepath)) {
        return filepath;
      }
    }
    return require.resolve(name);
  } catch (err) {};
  return null;
}

resolve.file = function(name, options) {
  var opts = utils.extend({cwd: process.cwd()}, options);
  var cwd = utils.cwd(opts.cwd);
  var first = name.charAt(0);
  var file, fp;

  switch (first) {
    case '~':
      fp = utils.expandTilde(name);
      break;
    case '.':
    default: {
      fp = path.resolve(cwd, name);
      break;
    }
  }

  if (fp.indexOf('npm:') === 0) {
    fp = path.resolve(utils.gm, fp.slice(4));
  }

  if (!utils.exists(fp)) {
    try {
      if (/[\\\/]/.test(name)) {
        var basename = path.basename(name);
        var modulePath = require.resolve(path.dirname(name));
        fp = path.resolve(path.dirname(modulePath), basename);
      }

      if (!utils.exists(fp)) {
        fp = require.resolve(name);
      }
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
    };
  }

  if (utils.exists(fp)) {
    return utils.createFile({path: fp, cwd: cwd}, opts.resolve);
  }

  return null;
};

/**
 * Export `resolve`
 * @type {Function}
 */

module.exports = resolve;
