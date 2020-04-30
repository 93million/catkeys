const fs = require('fs')
const tar = require('tar-stream')
const zlib = require('zlib')

module.exports = async (keyPath) => {
  const extract = tar.extract()
  const file = fs.createReadStream(keyPath)
  const extracted = {}

  return new Promise((resolve, reject) => {
    const gunzip = zlib.createGunzip()

    extract.on('entry', (header, stream, next) => {
      extracted[header.name] = []
      stream.on('data', (chunk) => {
        extracted[header.name].push(chunk)
      })
      stream.on('end', next)
      stream.resume()
    })

    extract.on('finish', () => {
      resolve({
        ca: Buffer.concat(extracted['ca-crt.pem']),
        cert: Buffer.concat(extracted['crt.pem']),
        key: Buffer.concat(extracted['key.pem'])
      })
    })
    file.pipe(gunzip).pipe(extract)
  })
}
