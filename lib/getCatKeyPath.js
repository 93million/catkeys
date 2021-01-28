const fs = require('fs')
const util = require('util')
const locateKeysDir = require('./locateKeysDir')

const readdir = util.promisify(fs.readdir)

module.exports = async (catKey, { catKeysDir } = {}) => {
  const keyDir = catKeysDir || process.env.CAT_KEYS_DIR || await locateKeysDir()

  if (keyDir === undefined) {
    throw new Error('catkeys directory could not be found')
  }

  if (catKey !== undefined) {
    return `${keyDir}/${catKey}.catkey`
  } else if (process.env.CAT_KEY_NAME !== undefined) {
    return `${keyDir}/${process.env.CAT_KEY_NAME}.catkey`
  } else {
    const files = await readdir(keyDir)
    const keys = files.filter(filename => {
      const excludeDirKeys = ['server']
      const [ext, basename] = filename.split('.').reverse()

      return (ext === 'catkey' && excludeDirKeys.indexOf(basename) === -1)
    })

    if (keys.length !== 1) {
      throw new Error('Too many client keys! Specify one in env CAT_KEY_NAME')
    } else {
      return `${keyDir}/${keys[0]}`
    }
  }
}
