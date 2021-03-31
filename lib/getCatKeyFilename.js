const path = require('path')
const fileExists = require('./fileExists')

module.exports = async (keyDir, catKey) => {
  const catKeyPath = path.resolve(keyDir, `${catKey}.catkey`)
  const cahKeyPath = path.resolve(keyDir, `${catKey}.cahkey`)

  return (await fileExists(cahKeyPath)) ? cahKeyPath : catKeyPath
}
