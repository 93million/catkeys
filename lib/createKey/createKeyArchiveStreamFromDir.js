const path = require('path')
const fs = require('fs')
const tar = require('tar-stream')
const zlib = require('zlib')
const { promisify } = require('util')

const stat = promisify(fs.stat)
const clientKeyFilenames = ['ca-crt.pem', 'crt.pem', 'key.pem']
const serverKeyFilenames = [...clientKeyFilenames, 'ca-key.pem', '.srl']

module.exports = async (keydir, { server = false } = {}) => {
  const pack = tar.pack()
  const gzip = zlib.createGzip()
  const filenames = (server === true) ? serverKeyFilenames : clientKeyFilenames

  await filenames.reduce(
    (acc, filename) => {
      const filePath = path.resolve(keydir, filename)

      return acc
        .then(() => stat(filePath))
        .then((stat) => new Promise(
          (resolve, reject) => {
            const entry = pack.entry({ ...stat, name: filename }, (err) => {
              if (err !== undefined) {
                reject(err)
              } else {
                resolve()
              }
            })

            fs.createReadStream(filePath).pipe(entry)
          }
        ))
    },
    Promise.resolve()
  )

  pack.finalize()

  return pack.pipe(gzip)
}
