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

describe('resolve file', function() {
  before(function(cb) {
    if (!exists(path.resolve(gm, 'generate-foo'))) {
      npm.install('generate-foo', cb);
    } else {
      cb();
    }
  });

  it('should suppress errors for files that do not exist', function() {
    var file = resolve.file('afsdsaijfsaldsls.txt');
    assert.equal(file, null);
  });

  it('should suppress errors for that do not exist at a specified cwd', function() {
    var file = resolve.file('afsdsaijfsaldsls.txt', {cwd: gm});
    assert.equal(file, null);
  });

  it('should resolve a file local to the default cwd', function() {
    var file = resolve.file('test/fixtures/root.txt');
    assert.equal(file.path, path.resolve(process.cwd(), 'test/fixtures/root.txt'));
    assert.equal(fs.readFileSync(file.path, 'utf8'), 'I am grot.\n');
  });

  it('should resolve a an absolute file', function() {
    var abs = path.resolve(process.cwd(), 'test/fixtures/root.txt');
    var file = resolve.file(abs);
    assert.equal(file.path, abs);
    assert.equal(fs.readFileSync(file.path, 'utf8'), 'I am grot.\n');
  });

  it('should resolve a file in the user home directory', function() {
    var file = resolve.file('~/.npmrc');
    assert.equal(file.path, path.resolve(expandTilde('~/'), '.npmrc'));
  });

  it('should resolve a global module', function() {
    var file = resolve.file('generate-foo', {cwd: gm});
    assert.equal(file.path, path.resolve(gm, 'generate-foo'));
  });

  it('should resolve the given file in a global module', function() {
    var file = resolve.file('generate-foo/verbfile.js', {cwd: gm});
    assert.equal(file.path, path.resolve(gm, 'generate-foo/verbfile.js'));
  });

  it('should resolve the `pkg.main` file in a global module', function() {
    var file = resolve.file('generate-foo/generator.js', {cwd: gm});
    assert.equal(file.path, path.resolve(gm, 'generate-foo/generator.js'));
  });

  it('should resolve file.path using a custom resolve function', function() {
    var file = resolve.file('generate-foo', {
      cwd: gm,
      resolve: function(file) {
        file.path = path.join(file.path, 'generator.js');
      }
    });
    assert.equal(file.path, path.resolve(gm, 'generate-foo/generator.js'));
  });

  it('should resolve file.path when custom resolve function returns path', function() {
    var file = resolve.file('generate-foo', {
      cwd: gm,
      resolve: function(file) {
        return path.join(file.path, 'generator.js');
      }
    });
    assert.equal(file.path, path.resolve(gm, 'generate-foo/generator.js'));
  });

  it('should resolve to the main file of a package in node_modules', function() {
    var file = resolve.file('mocha');
    assert.equal(file.path, path.resolve(process.cwd(), 'node_modules/mocha/index.js'));
  });

  it('should resolve to a file in a package in node_modules', function() {
    var file = resolve.file('expand-tilde/LICENSE');
    assert.equal(file.path, path.resolve(process.cwd(), 'node_modules/expand-tilde/LICENSE'));
  });

  it('should resolve to a file in a node module using `cwd` option', function() {
    var file = resolve.file('LICENSE', { cwd: 'node_modules/expand-tilde' });
    assert.equal(file.path, path.resolve(process.cwd(), 'node_modules/expand-tilde/LICENSE'));
  });
});
