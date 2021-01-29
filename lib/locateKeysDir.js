const fileExists = require('./fileExists')
const path = require('path')

module.exports = async () => {
  const parentDirs = path.dirname(__filename).split(path.sep)
  const searchPaths = parentDirs.map((dir, i, dirs) => [...dirs]
    .splice(0, dirs.length - i)
    .concat('catkeys')
    .join(path.sep)
  )
  const searchPathResults = await Promise.all(searchPaths.map(fileExists))

  return searchPaths.find((path, i) => (searchPathResults[i] === true))
}
