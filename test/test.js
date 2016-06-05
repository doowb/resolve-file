'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var exists = require('fs-exists-sync');
var gm = require('global-modules');
var npm = require('npm-install-global');
var expandTilde = require('expand-tilde');
var resolve = require('../');

describe('resolve filepath', function() {
  before(function(cb) {
    if (!exists(path.resolve(gm, 'generate-foo'))) {
      npm.install('generate-foo', cb);
    } else {
      cb();
    }
  });

  it('should resolve a file local to the default cwd', function() {
    var fp = resolve('test/fixtures/root.txt');
    assert.equal(fp, path.resolve(process.cwd(), 'test/fixtures/root.txt'));
    assert.equal(fs.readFileSync(fp, 'utf8'), 'I am grot.\n');
  });

  it('should resolve a an absolute file', function() {
    var abs = path.resolve(process.cwd(), 'test/fixtures/root.txt');
    var fp = resolve(abs);
    assert.equal(fp, abs);
    assert.equal(fs.readFileSync(fp, 'utf8'), 'I am grot.\n');
  });

  it('should resolve a file in the user home directory', function() {
    var fp = resolve('~/.npmrc');
    assert.equal(fp, path.resolve(expandTilde('~/'), '.npmrc'));
  });

  it('should resolve a global module', function() {
    var fp = resolve('generate-foo', {cwd: gm});
    assert.equal(fp, path.resolve(gm, 'generate-foo'));
  });

  it('should resolve a specified file in a global module', function() {
    var fp = resolve('generate-foo/generator.js', {cwd: gm});
    assert.equal(fp, path.resolve(gm, 'generate-foo/generator.js'));
  });

  it('should resolve to the main file of a package in node_modules', function() {
    var fp = resolve('mocha');
    assert.equal(fp, path.resolve(process.cwd(), 'node_modules/mocha/index.js'));
  });

  it('should resolve to a file in a package in node_modules', function() {
    var fp = resolve('expand-tilde/LICENSE');
    assert.equal(fp, path.resolve(process.cwd(), 'node_modules/expand-tilde/LICENSE'));
  });

  it('should resolve to a file in a node module using `cwd` option', function() {
    var fp = resolve('LICENSE', { cwd: 'node_modules/expand-tilde' });
    assert.equal(fp, path.resolve(process.cwd(), 'node_modules/expand-tilde/LICENSE'));
  });
});
