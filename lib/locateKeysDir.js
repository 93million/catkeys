const fileExists = require('./fileExists')
const path = require('path')

module.exports = async () => {
  const parentDirs = path.dirname(__filename).split(path.sep)
  const searchPaths = parentDirs.reduce(
    (acc, _, i) => [
      ...acc,
      ...['catkeys', 'cahkeys'].map((keyDir) => (
        [...parentDirs]
          .splice(0, parentDirs.length - i)
          .concat(keyDir)
          .join(path.sep)
      ))
    ],
    []
  )
  const searchPathResults = await Promise.all(
    searchPaths.map((path) => fileExists(path))
  )

  return searchPaths.find((path, i) => (searchPathResults[i] === true))
}
