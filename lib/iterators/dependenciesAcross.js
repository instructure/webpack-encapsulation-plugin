const MultiEntryDependency = require('webpack/lib/dependencies/MultiEntryDependency')
const SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency')

// iterate over the relevant* reasons found across the given set of modules,
// yielding a tuple of 1) a slice containing the [source, target, and request]
// and 2) the actual reason in case you need to access its module/issuer
//
// * a reason is relevant iff its dependency is not an entrypoint and the
//   edge it represents has not been encountered before
//
// ---
//
// this is an abstraction over deep webpack internals and is coupled to the
// compiler.compilation.finishModules hook in the sense that it expects
// reasons to be fulfilled
const dependenciesAcross = function*(modules) {
  // memo of visited edges, necessary because multiple reason records could
  // represent the same edge as far as we're concerned and i found no way to
  // dedupe them short of marshalling the relevant properties
  const visited = {}

  for (const module of modules) {
    for (const reason of module.reasons) {
      if (isDependencyRelevant(reason.dependency)) {
        const dependency = {
          source: reason.module.resource,
          target: module.resource,
          request: reason.dependency.userRequest
        }

        const edge = Object.values(dependency).toString()

        if (!visited.hasOwnProperty(edge)) {
          visited[edge] = 1

          yield [dependency, reason]
        }
      }
    }
  }
}

const isDependencyRelevant = (dependency) => {
  return (
    !(dependency instanceof SingleEntryDependency) &&
    !(dependency instanceof MultiEntryDependency)
  )
}

module.exports = dependenciesAcross
