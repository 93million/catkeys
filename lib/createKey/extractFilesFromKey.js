const tarStream = require('tar-stream')
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

module.exports = (keyPath, outputDir, { include, exclude } = {}) => new Promise(
  (resolve, reject) => {
    const gunzip = zlib.createGunzip()
    const file = fs.createReadStream(keyPath)
    const extract = tarStream.extract()

    extract.on('entry', (header, stream, next) => {
      if (
        (include !== undefined && include.includes(header.name) === false) ||
        (exclude !== undefined && exclude.includes(header.name) === true)
      ) {
        next()
      } else {
        const outputFile = fs
          .createWriteStream(path.resolve(outputDir, header.name))

        outputFile.on('error', reject)

        stream.on('end', () => next())

        stream.pipe(outputFile)
      }
    })

    extract.on('error', reject)
    gunzip.on('error', reject)
    file.on('error', reject)

    extract.on('finish', resolve)

    file.pipe(gunzip).pipe(extract)
  }
)
