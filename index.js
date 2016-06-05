/*!
 * resolve-file <https://github.com/doowb/resolve-file>
 *
 * Copyright (c) 2015, Brian Woodward, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

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
 * var fp = resolveFile('./index.js')
 * //=> /path/to/resolve-file/index.js
 * ```
 *
 * @param  {String} `name` Filename to resolve
 * @param  {Object} `options` Additional options to specify `cwd`
 * @return {String} Resolve `filepath` if found
 * @api public
 */

function resolveFile(name, options) {
  var opts = utils.extend({cwd: process.cwd()}, options);
  var cwd = utils.cwd(opts.cwd);
  var fp;

  var first = name.charAt(0);
  if (first === '.') {
    return path.resolve(cwd, name);
  }

  if (first === '/') {
    return path.resolve(name);
  }

  if (first === '~') {
    return utils.expandTilde(name);
  }

  try {
    if (/[\\\/]/.test(name)) {
      var basename = path.basename(name);
      var modulePath = utils.resolve.sync(path.dirname(name));
      var filepath = path.resolve(path.dirname(modulePath), basename);
      if (utils.exists(filepath)) {
        return filepath;
      }
    }
    return utils.resolve.sync(name);
  } catch (err) {};

  fp = path.resolve(cwd, name);
  if (utils.exists(fp)) {
    return fp;
  }
  return null;
}

/**
 * Export `resolveFile`
 * @type {Function}
 */

module.exports = resolveFile;
