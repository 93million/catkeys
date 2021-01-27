const tarStream = require('tar-stream')
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

module.exports = async (keyPath, outputDir, filenames) => new Promise(
  (resolve, reject) => {
    const gunzip = zlib.createGunzip()
    const file = fs.createReadStream(keyPath)
    const extract = tarStream.extract()

    extract.on('entry', (header, stream, next) => {
      if (
        filenames !== undefined &&
        filenames.includes(header.name) === false
      ) {
        next()
      } else {
        const outputFile = fs
          .createWriteStream(path.resolve(outputDir, header.name))

        stream.on('end', () => next())

        stream.pipe(outputFile)
      }
    })

    extract.on('error', reject)
    extract.on('finish', resolve)

    file.pipe(gunzip).pipe(extract)
  }
)
