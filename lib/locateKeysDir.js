const fileExists = require('./fileExists')
const appRootPath = require('app-root-path')

module.exports = async () => {
  const searchPaths = ['catkeys', 'cahkeys']
    .map((catKeysDir) => appRootPath.resolve(catKeysDir))
  const searchPathResults = await Promise.all(
    searchPaths.map((path) => fileExists(path))
  )

  return searchPaths.find((path, i) => (searchPathResults[i] === true))
}
