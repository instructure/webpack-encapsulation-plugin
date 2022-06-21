## 3.0.0

- now compatible only with Webpack 5, if you're still using Webpack 4, continue
  to use the version 2 line of this package
- errors are now reported at an earlier stage in the compilation and are now
  presented as ModuleNotFound errors as a consequence
- `permit` is a new option to exclude specific violations from being reported
- added basic default formatting for errors to use when `formatError` is absent

## 2.0.0

- `ruleOutput` forwarding has been removed since esmac no longer supports it

## 1.0.0

Initial release with support for Webpack 4 module dependency traversal and
raising of access violation and specifier mismatch errors.