'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var resolve = require('../');
var expandTilde = require('expand-tilde');

describe('resolve-file', function () {
  it('should resolve a file local to the default cwd', function () {
    var fp = resolve('./test/fixtures/root.txt');
    assert.equal(fp, path.resolve(process.cwd(), './test/fixtures/root.txt'));
    assert.equal(fs.readFileSync(fp, 'utf8'), 'I am grot.\n');
  });

  it('should resolve a an absolute file', function () {
    var abs = path.resolve(process.cwd(), './test/fixtures/root.txt');
    var fp = resolve(abs);
    assert.equal(fp, abs);
    assert.equal(fs.readFileSync(fp, 'utf8'), 'I am grot.\n');
  });

  it('should resolve a file in the home directory', function () {
    var fp = resolve('~/.npmrc');
    assert.equal(fp, path.resolve(expandTilde('~/'), '.npmrc'));
  });

  it('should resolve to a node module', function () {
    var fp = resolve('cwd');
    assert.equal(fp, path.resolve(process.cwd(), './node_modules/cwd/index.js'));
  });

  it('should resolve to a file in a node module', function () {
    var fp = resolve('cwd/LICENSE');
    assert.equal(fp, path.resolve(process.cwd(), './node_modules/cwd/LICENSE'));
  });

  it('should resolve to a file in a node module using `cwd` option', function () {
    var fp = resolve('LICENSE', { cwd: './node_modules/cwd' });
    assert.equal(fp, path.resolve(process.cwd(), './node_modules/cwd/LICENSE'));
  });
});
