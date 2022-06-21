// A module imports another when it shouldn't at all
class AccessViolationError extends Error {
  constructor({ source, target, request }) {
    super()

    this.name = 'AccessViolationError'
    this.source = source
    this.target = target
    this.request = request
  }

  getDefaultMessage() {
    let message = ''
    let hint = ''

    message += `\nAccess to the following module is not allowed from this layer:`
    message += `\n \n`
    message += `    ${this.request}`
    message += `\n \n`
    message += `Which resolved to:`
    message += `\n \n`
    message += `    ${this.target}`
    message += `\n`

    return message
  }
}

module.exports = AccessViolationError
