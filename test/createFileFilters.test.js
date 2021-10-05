const subject = require('../lib/createFileFilters')
const { assert } = require('chai')

describe('createFileFilters', () => {
  it('can test files', () => {
    assert.ok(subject({ test: /\.js$/ }).every(f => f('foo.js')))
    assert.notOk(subject({ test: /\.js$/ }).every(f => f('foo.yml')))
  })

  it('can whitelist files that start with a path', () => {
    assert.ok(subject({ include: ['lib'] }).every(f => f('lib/foo.js')))
    assert.notOk(subject({ include: ['lib'] }).every(f => f('foo.js')))
  })

  it('can whitelist files that match a pattern', () => {
    assert.ok(subject({ include: [/\blib\b/] }).every(f => f('lib/foo.js')))
    assert.notOk(subject({ include: [/\blib\b/] }).every(f => f('foo.js')))
  })

  it('can blacklist files that start with a path', () => {
    assert.notOk(subject({ exclude: ['lib'] }).every(f => f('lib/foo.js')))
    assert.ok(subject({ exclude: ['lib'] }).every(f => f('foo.js')))
  })

  it('can blacklist files that match a pattern', () => {
    assert.notOk(subject({ exclude: [/\blib\b/] }).every(f => f('lib/foo.js')))
    assert.ok(subject({ exclude: [/\blib\b/] }).every(f => f('foo.js')))
  })
})
