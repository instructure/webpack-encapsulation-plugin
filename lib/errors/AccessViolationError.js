// A module imports another when it shouldn't at all
class AccessViolationError extends Error {
  constructor({ source, target, request }) {
    super()

    this.name = 'AccessViolationError'
    this.source = source
    this.target = target
    this.request = request
  }
}

module.exports = AccessViolationError
