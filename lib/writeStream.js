const fs = require('fs')

module.exports = async (stream, path) => new Promise((resolve, reject) => {
  const archive = fs.createWriteStream(path)

  archive.on('close', resolve)
  archive.on('error', reject)

  stream.pipe(archive)
})
