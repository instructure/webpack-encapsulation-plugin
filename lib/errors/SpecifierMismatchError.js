// A module imports another using a specifier other than the one it's allowed to
// use, e.g. using bare when it should use relative
class SpecifierMismatchError extends Error {
  constructor({ rule, ruleIndex, source, target, request }) {
    super()

    this.name = 'SpecifierMismatchError'
    this.rule = rule
    this.ruleIndex = ruleIndex
    this.source = source
    this.target = target
    this.request = request
  }
}

module.exports = SpecifierMismatchError
