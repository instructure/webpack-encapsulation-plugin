const esmac = require('esmac')
const path = require('path')
const createFileFilters = require('./createFileFilters')
const createSpecifier = require('./createSpecifier')
const AccessViolationError = require('./errors/AccessViolationError')
const SpecifierMismatchError = require('./errors/SpecifierMismatchError')
const EntryDependency = require('webpack/lib/dependencies/EntryDependency')
const ContextElementDependency = require('webpack/lib/dependencies/ContextElementDependency')

class ModuleEncapsulationPlugin {
  constructor({ formatter, rules, exclude, include, test, permit }) {
    this.rules = rules
    this.permit = permit || []
    this.formatError = formatter || (x => x.getDefaultMessage())
    this.filters = createFileFilters({
      exclude,
      include,
      test,
    })
  }

  apply(compiler) {
    const checker = new EdgeChecker({
      context: compiler.options.context,
      rules: this.rules
    })

    compiler.hooks.normalModuleFactory.tap('ESMAC', nmf => {
      nmf.hooks.afterResolve.tap('ESMAC', resolveData => {
        if (isDependencyRelevant(resolveData.dependencies[0])) {
          const edge = {
            source: resolveData.contextInfo.issuer,
            target: resolveData.createData.resource,
            request: resolveData.request,
          }

          if (this.isEdgeCovered(edge)) {
            const error = checker.apply(edge)

            if (error && !this.isErrorPermitted(error)) {
              error.message = this.formatError(error)
              throw error
            }
          }
        }
      })
    })
  }

  isEdgeCovered({ source, target }) {
    return this.filters.every(f => f(source) && f(target))
  }

  isErrorPermitted(error) {
    return this.permit.some(spec => (
      spec.name === error.name &&
      spec.source === error.source &&
      spec.target === error.target &&
      spec.request === error.request
    ))
  }
}

// Tells you whether a dependency violates any specifier rule, or whether it's
// not covered by any rule at all
//
// It can do this by having access to both plugin and compiler options while
// also being free from all webpack internal garbage, part of why i was inclined
// to make it its own thing
//
// See https://github.com/instructure/esmac for the actual rule application
class EdgeChecker {
  constructor({ context, rules }) {
    this.relativize = context ? file => path.relative(context, file) : identity
    this.rules = rules
    this.check = esmac(
      rules.map(rule =>
        Object.assign({}, rule, {
          specifier: createSpecifier(asArray(rule.specifier), {
            context
          })
        })
      )
    )
  }

  apply({ source, target, request }) {
    // relativize source and target paths so that rule patterns don't
    // need to consider the context, e.g. ui/foo instead of **/ui/foo
    //
    // just a bit more readable and relieves the formatters of extra
    // work to make paths friendly
    const edge = {
      source: this.relativize(source),
      target: this.relativize(target),
      request
    }

    const result = this.check(edge)

    if (result === null) {
      return new AccessViolationError(edge)
    }

    const [valid, ruleIndex] = result

    if (valid === false) {
      return new SpecifierMismatchError({
        ...edge,
        rule: this.rules[ruleIndex],
        ruleIndex: ruleIndex,
      })
    }
    else {
      return null
    }
  }
}

const asArray = x => Array.isArray(x) ? x : [x]
const identity = x => x
const isDependencyRelevant = dep => (
  !(dep instanceof EntryDependency) &&
  !(dep instanceof ContextElementDependency)
)

module.exports = ModuleEncapsulationPlugin
