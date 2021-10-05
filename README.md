# Webpack Encapsulation Plugin

An implementation of [esmac] for Webpack to control access between modules and
enforce file-layer encapsulation. See that project for more details.

## Usage

The plugin has a familiar Webpack interface for filtering the files it runs
against, similar to what you would do with a loader. `rules` is the only
required argument, which is the set of rules to provide to [esmac].

```javascript
// file: webpack.config.js
const EncapsulationPlugin = require('webpack-encapsulation-plugin')

module.exports = {
  plugins: [
    new EncapsulationPlugin({
      rules: [ ... ]
    })
  ]
}
```

The plugin can generate 2 types of errors that are added to the compilation's
list of errors after the modules have been built:

- `AccessViolationError` when no rule was found to cover the dependency
- `SpecifierMismatchError` when a rule was found but the specifier check failed

You can choose to format the errors into something meaningful to your users
by implementing the `formatter` function, described in Options.

## Options

See [./types.d.ts](./types.d.ts) for the available options.

## License

MIT

[esmac]: https://github.com/instructure/esmac
