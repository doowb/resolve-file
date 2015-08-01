/*!
 * resolve-file <https://github.com/doowb/resolve-file>
 *
 * Copyright (c) 2015, Brian Woodward, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var expandTilde = require('expand-tilde');
var resolve = require('resolve');
var pkg = require('load-pkg');
var dir = require('cwd');

function resolveFile(name, options) {
  options = options || {};
  var cwd = dir(options.cwd || process.cwd());
  var first = name.charAt(0);
  if (first === '.') {
    return path.resolve(cwd, name);
  }

  if (first === '/') {
    return path.resolve(name);
  }

  if (first === '~') {
    return expandTilde(name);
  }

  try {
    var file, i;
    if ((i = name.indexOf('/')) !== -1) {
      var fp = resolve.sync(name.slice(0, i));
      var rest = path.normalize(name.slice(i + 1));
      var res = path.resolve(path.dirname(fp), rest);
      if (fs.existsSync(res)) {
        return res;
      }
    }
    return resolve.sync(name);
  } catch(err) {};

  var fp = path.resolve(cwd, name);
  return fs.existsSync(fp) ? fp : null;
}

module.exports = resolveFile;
