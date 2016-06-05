'use strict';

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
require('resolve');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
