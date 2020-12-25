const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const loadKey = require('./loadKey')

const readdir = promisify(fs.readdir)

module.exports = async (keysDir) => {
  const dirItems = await readdir(keysDir)

  return Promise.all(
    dirItems.map((dirItem) => loadKey(path.resolve(keysDir, dirItem)))
  )
}
