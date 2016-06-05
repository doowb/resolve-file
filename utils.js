'use strict';

var fs = require('fs');
var path = require('path');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('cwd');
require('expand-tilde');
require('extend-shallow', 'extend');
require('fs-exists-sync', 'exists');
require('global-modules', 'gm');
require('load-pkg');
require = fn;

utils.createFile = function(file, fn) {
  var stat;

  /**
   * Decorate `file` with `stat` object
   */

  Object.defineProperty(file, 'stat', {
    configurable: true,
    set: function(val) {
      stat = val;
    },
    get: function() {
      if (stat) {
        return stat;
      }
      if (!this.path) {
        throw new Error('expected file.path to be a string, cannot get file.stat');
      }
      if (utils.exists(this.path)) {
        stat = fs.lstatSync(this.path);
        return stat;
      }
    }
  });

  /**
   * Decorate `file` with `basename` and `dirname`
   */

  file.basename = path.basename(file.path);
  file.dirname = path.dirname(file.path);

  // do a quick check to see if `file.basename` has a dot. If not, then check to see
  // if `file.path` is a directory and if so attempt to resolve an actual file in
  // the directory
  if (!/\./.test(file.basename) && file.stat.isDirectory()) {
    var orig = file.path;
    var fp;

    if (typeof fn === 'function') {
      // allow `file.path` to be updated or returned
      var res = fn(file);
      fp = res || file.path;
    } else {
      var pkg = utils.loadPkg.sync(file.path || process.cwd());
      if (pkg && pkg.main) {
        fp = path.resolve(file.path, pkg.main);
      } else {
        // just resolve to `index.js` to keep this fast, since custom fn is
        // allowed and we reset to orig if it doesn't exist anyway
        fp = path.resolve(file.path, 'index.js');
      }
    }

    if (fp && utils.exists(fp)) {
      file.path = fp;
      file.basename = path.basename(file.path);
      file.dirname = path.dirname(file.path);
    }
  }
  return file;
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
