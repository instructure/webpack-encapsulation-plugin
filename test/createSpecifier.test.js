const absolute = require('esmac/specifiers/absolute');
const any = require('esmac/specifiers/any');
const bare = require('esmac/specifiers/bare');
const package = require('esmac/specifiers/package');
const relative = require('esmac/specifiers/relative');
const subject = require('../lib/createSpecifier')
const { assert } = require('chai')

describe('createSpecifier', () => {
  it('can create "bare"', () => {
    assert.equal(bare, subject(['bare', {}], {})[0])
  })

  it('can create "any"', () => {
    assert.equal(any, subject(['any', {}], {})[0])
  })

  it('can create "absolute"', () => {
    assert.equal(absolute, subject(['absolute', {}], {})[0])
  })

  it('can create "package"', () => {
    assert.equal(package, subject(['package', {}], {})[0])
  })

  it('assigns the "expand" option for "package" given a context dir', () => {
    const [specifier, options] = subject(['package', {}], {
      context: 'blah'
    })

    assert.equal(typeof options.expand, 'function')
    assert.equal(options.expand('blah'), 'blah/blah')
  })

  it('can create "relative"', () => {
    assert.equal(relative, subject(['relative', {}], {})[0])
  })
})
