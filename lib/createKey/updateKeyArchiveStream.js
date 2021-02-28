const tar = require('tar-stream')
const zlib = require('zlib')

module.exports = async (stream, entries) => {
  const extract = tar.extract()
  const pack = tar.pack()
  const gzip = zlib.createGzip()
  const gunzip = zlib.createGunzip()

  extract.on('entry', function (header, entryStream, callback) {
    if (entries[header.name] !== undefined) {
      pack.entry({ name: header.name }, entries[header.name], callback)
      callback()
    } else {
      entryStream.pipe(pack.entry(header, callback))
    }
  })

  stream.pipe(gunzip).pipe(extract)

  await new Promise((resolve, reject) => {
    stream.on('error', reject)
    gunzip.on('error', reject)
    extract.on('error', reject)
    extract.on('finish', resolve)
  })

  pack.finalize()

  return pack.pipe(gzip)
}
