// simulate the file selection behavior that webpack provides for loaders, as
// there is no counterpart for plugins :sadge:
//
//     {
//       test: /\.js$/,
//       include: [ path.join(__dirname, 'lib') ],
//       exclude: [ /node_modules/ ]
//     }
//
const createFileFilters = ({ test, include = [], exclude = [] }) => {
  const filters = []

  if (test) {
    filters.push(x => test.test(x))
  }

  if (include.length > 0) {
    const includeFilters = include.map(filterByPathOrRegex)
    filters.push(x => includeFilters.some(y => y(x)))
  }

  if (exclude.length > 0) {
    const excludeFilters = exclude.map(filterByPathOrRegex)
    filters.push(x => !excludeFilters.some(y => y(x)))
  }

  return filters
}

const filterByPathOrRegex = filter => {
  if (filter instanceof RegExp) {
    return x => filter.test(x)
  }
  else if (typeof filter === 'string') {
    return x => x.startsWith(filter)
  }
  else {
    invariant(false, "filter must be either a String or a RegExp")
  }
}

module.exports = createFileFilters
