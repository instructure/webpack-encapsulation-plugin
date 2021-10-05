const esmac = require('esmac')
const path = require('path')
const createFileFilters = require('./createFileFilters')
const createSpecifier = require('./createSpecifier')
const dependenciesAcross = require('./iterators/dependenciesAcross')
const AccessViolationError = require('./errors/AccessViolationError')
const SpecifierMismatchError = require('./errors/SpecifierMismatchError')

class ModuleEncapsulationPlugin {
  constructor({ formatter, rules, exclude, include, test }) {
    this.rules = rules
    this.formatError = formatter || (x => x.message)
    this.filters = createFileFilters({
      exclude,
      include,
      test,
    })
  }

  apply(compiler) {
    const checker = new DependencyChecker({
      context: compiler.options.context,
      rules: this.rules
    })

    compiler.hooks.compilation.tap('ModuleEncapsulationPlugin', compilation => {
      // there's a good / not so good reason why we're hooking into this as
      // opposed to, say, nmf.afterResolve which does have all the information
      // we need: for some reason the errors reported to that hook end up
      // leaking to other modules!
      //
      // i dug a little and perhaps not enough but it seems related to the fact
      // that request.resourceResolveData.context.issuer is fixated on the
      // origin module that had first attempted to resolve the target, and if
      // that fails to resolve because it doesn't pass the specifier checks,
      // then all subsequent resolves to the target by _other_ modules will also
      // be flagged as having failed, which :sadge:
      //
      // beats me but i won't live forever so i'll spend my time elsewhere
      compilation.hooks.finishModules.tap('ModuleEncapsulationPlugin', modules => {
        for (const [dependency, reason] of dependenciesAcross(modules)) {
          if (this.isDependencyCovered(dependency)) {
            const error = checker.apply(dependency)

            if (error) {
              error.message = this.formatError(error)
              error.module = reason.module
              error.origin = reason.module.issuer

              compilation.errors.push(error)
            }
          }
        }

        return modules
      })
    })
  }

  isDependencyCovered({ source, target }) {
    return this.filters.every(f => f(source) && f(target))
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
class DependencyChecker {
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

  apply(expandedDependency) {
    // relativize source and target paths so that rule patterns don't
    // need to consider the context, e.g. ui/foo instead of **/ui/foo
    //
    // just a bit more readable and relieves the formatters of extra
    // work to make paths friendly
    const dependency = {
      source: this.relativize(expandedDependency.source),
      target: this.relativize(expandedDependency.target),
      request: expandedDependency.request
    }

    const result = this.check(dependency)

    if (result === null) {
      return new AccessViolationError(dependency)
    }

    const [valid, ruleIndex] = result

    if (valid === false) {
      return new SpecifierMismatchError({
        ...dependency,
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

module.exports = ModuleEncapsulationPlugin
