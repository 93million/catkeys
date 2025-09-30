const fs = require('fs')
const util = require('util')
const locateKeysDir = require('./locateKeysDir')
const path = require('path')
const getCatKeyFileName = require('./getCatKeyFilename')

const readdir = util.promisify(fs.readdir)

module.exports = async (catKey, { catKeysDir } = {}) => {
  const keyDir = catKeysDir || process.env.CAT_KEYS_DIR || await locateKeysDir()

  if (keyDir === undefined) {
    throw new Error('catkeys directory could not be found')
  }

  if (catKey !== undefined) {
    return getCatKeyFileName(keyDir, catKey)
  } else if (process.env.CAT_KEY_NAME !== undefined) {
    return getCatKeyFileName(keyDir, process.env.CAT_KEY_NAME)
  } else {
    const files = await readdir(keyDir)
    const keys = files.filter(filename => {
      const excludeKeyNames = ['server']
      const [ext, basename] = filename.split('.').reverse()
      const keyExts = ['catkey', 'cahkey']

      return (keyExts.includes(ext) && !excludeKeyNames.includes(basename))
    })

    if (keys.length !== 1) {
      const msg = keys.length > 1
        ? [
            'Too many client catkeys!',
            'Specify which one to use in env CAT_KEY_NAME or `catKey` option'
          ].join(' ')
        : `Unable to find catkey in directory ${keyDir}`

      throw new Error(msg)
    } else {
      return path.resolve(keyDir, keys[0])
    }
  }
}
