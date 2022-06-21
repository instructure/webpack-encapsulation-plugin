const EncapsulationPlugin = require('webpack-encapsulation-plugin')
const AccessViolationError = require('webpack-encapsulation-plugin/errors/AccessViolationError')
const SpecifierMismatchError = require('webpack-encapsulation-plugin/errors/SpecifierMismatchError')
const path = require('path')
const webpack = require('webpack')
const { assert } = require('chai')

describe('EncapsulationPlugin', () => {
  it('works', (done) => {
    const compiler = webpack(require('./fixture/webpack.config.js'))

    const runAssertions = errors => {
      const sort = x => x.sort((a,b) => a.source > b.source ? 1 : -1)
      const errorsInOrder = sort(errors.map(error => {
        return {
          name: error.name,
          source: error.source,
          target: error.target,
          request: error.request,
          ruleIndex: error.ruleIndex,
        }
      }))

      assert.deepEqual(errorsInOrder, sort([
        {
          name: 'SpecifierMismatchError',
          source: 'lib/b.js',
          target: 'lib/c.js',
          request: 'me-in-test/lib/c.js',
          ruleIndex: 0,
        },
        {
          name: 'SpecifierMismatchError',
          source: 'packages/bar/lib/index.js',
          target: 'packages/foo/lib/index.js',
          request: '../../foo/lib',
          ruleIndex: 2,
        },
        {
          name: 'AccessViolationError',
          source: 'packages/bar/lib/index.js',
          target: 'lib/a.js',
          request: 'me-in-test/lib/a',
          ruleIndex: undefined,
        },
        {
          name: 'SpecifierMismatchError',
          source: 'packages/foo/lib/index.js',
          target: 'packages/foo/lib/b.js',
          request: 'foo/lib/b',
          ruleIndex: 1,
        }
      ]))
    }

    compiler.run(function(err, output) {
      if (err) {
        done(err)
      }
      else {
        const webpackErrors = []
        const ourErrors = []

        for (const error of output.compilation.errors) {
          if (isOurError(error.error)) {
            ourErrors.push(error)
          }
          else {
            webpackErrors.push(error)
          }
        }

        if (webpackErrors.length) {
          done(...webpackErrors)
        }
        else {
          try {
            runAssertions(ourErrors.map(x => x.error))
            done()
          }
          catch (e) {
            done(e)
          }
        }
      }
    })
  })
})

const isOurError = error => (
  (error instanceof SpecifierMismatchError) ||
  (error instanceof AccessViolationError)
)
