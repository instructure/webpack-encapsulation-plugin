const path = require('path')
const absolute = require('esmac/specifiers/absolute');
const any = require('esmac/specifiers/any');
const bare = require('esmac/specifiers/bare');
const package = require('esmac/specifiers/package');
const relative = require('esmac/specifiers/relative');

const createSpecifier = ([ name, options = {} ], { context }) => {
  if (name === 'absolute') {
    return [absolute, options]
  }
  else if (name === 'bare') {
    return [bare, options]
  }
  else if (name === 'package') {
    const packageOptions = { ...options }

    if (context) {
      packageOptions.expand = file => path.join(context, file)
    }

    return [package, packageOptions]
  }
  else if (name === 'relative') {
    return [relative, options]
  }
  else if (name === 'any') {
    return [any]
  }
}

module.exports = createSpecifier
