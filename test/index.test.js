const EncapsulationPlugin = require('webpack-encapsulation-plugin')
const AccessViolationError = require('webpack-encapsulation-plugin/errors/AccessViolationError')
const SpecifierMismatchError = require('webpack-encapsulation-plugin/errors/SpecifierMismatchError')
const path = require('path')
const webpack = require('webpack')
const { assert } = require('chai')

describe('EncapsulationPlugin', () => {
  it('works', (done) => {
    const AbortOnEmitError = new Error('Abort')
    const compiler = webpack({
      entry: path.resolve(__dirname, './fixture/lib/index.js'),
      context: path.resolve(__dirname, 'fixture'),
      resolve: {
        modules: [path.resolve(__dirname, 'fixture/packages')],
        alias: {
          'me-in-test': path.resolve(__dirname, 'fixture')
        }
      },
      plugins: [
        {
          apply(compiler) {
            compiler.hooks.emit.tapAsync('DontEmit', (compilation, callback) => {
              callback(AbortOnEmitError)
            })
          }
        },

        new EncapsulationPlugin({
          rules: [
            {
              source: 'lib/**',
              target: 'lib/**',
              specifier: 'relative'
            },
            {
              source: 'packages/*/**',
              target: 'packages/*/**',
              boundary: 0,
              specifier: 'relative',
            },
            {
              source: '**',
              target: 'packages/**',
              specifier: 'package'
            }
          ]
        })
      ]
    })

    const runAssertions = output => {
      const errors = output.compilation.errors
      const errorsInOrder = errors.map(error => {
        return {
          name: error.name,
          source: error.source,
          target: error.target,
          request: error.request,
          ruleIndex: error.ruleIndex,
          ruleOutput: error.ruleOutput,
        }
      }).sort((a,b) => a.source > b.source ? 1 : -1)

      assert.deepEqual(errorsInOrder, [
        {
          name: 'SpecifierMismatchError',
          source: 'lib/b.js',
          target: 'lib/c.js',
          request: 'me-in-test/lib/c.js',
          ruleIndex: 0,
          ruleOutput: {},
        },
        {
          name: 'SpecifierMismatchError',
          source: 'packages/bar/lib/index.js',
          target: 'packages/foo/lib/index.js',
          request: '../../foo/lib',
          ruleIndex: 2,
          ruleOutput: {
            pjsonFile: require.resolve('./fixture/packages/foo/package.json'),
            pjson: require('./fixture/packages/foo/package.json'),
          },
        },
        {
          name: 'AccessViolationError',
          source: 'packages/bar/lib/index.js',
          target: 'lib/a.js',
          request: 'me-in-test/lib/a',
          ruleIndex: undefined,
          ruleOutput: undefined,
        },
        {
          name: 'SpecifierMismatchError',
          source: 'packages/foo/lib/index.js',
          target: 'packages/foo/lib/b.js',
          request: 'foo/lib/b',
          ruleIndex: 1,
          ruleOutput: {}
        }
      ])
    }

    compiler.run(function(err, output) {
      // welcome, welcome to the land of all that is node
      if (err && err === AbortOnEmitError) {
        done(new Error('build should not have passed!!!'))
      }
      else if (err) {
        done(err)
      }
      else {
        const webpackErrors = output.compilation.errors.filter(notOurError)

        if (webpackErrors.length) {
          done(...webpackErrors)
        }
        else {
          try {
            runAssertions(output)
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

const notOurError = error => (
  !(error instanceof SpecifierMismatchError) &&
  !(error instanceof AccessViolationError)
)
