const tar = require('tar-stream')
const zlib = require('zlib')

module.exports = async (stream, entries) => {
  const extract = tar.extract()
  const pack = tar.pack()
  const gzip = zlib.createGzip()
  const gunzip = zlib.createGunzip()
  const tarEntryFilenames = []

  extract.on('entry', function (header, entryStream, callback) {
    tarEntryFilenames.push(header.name)

    if (entries[header.name] !== undefined) {
      pack.entry({ name: header.name }, entries[header.name])
      callback()
    } else {
      entryStream.pipe(pack.entry(header, callback))
    }
  })

  const promise = new Promise((resolve, reject) => {
    stream.on('error', reject)
    gunzip.on('error', reject)
    extract.on('error', reject)
    extract.on('finish', resolve)
  })

  stream.pipe(gunzip).pipe(extract)

  await promise

  const newEntries = Object
    .keys(entries)
    .filter((fileName) => (tarEntryFilenames.includes(fileName) === false))

  newEntries.forEach((name) => {
    pack.entry({ name }, entries[name])
  })

  pack.finalize()

  return pack.pipe(gzip)
}
