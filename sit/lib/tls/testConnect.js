const { testCatkeysDir } = require('../../filepaths')
const { tls } = require('../../..')

const client = (requestOptions = {}) => new Promise((resolve, reject) => {
  tls.connect({
    catKeysDir: testCatkeysDir,
    host: 'localhost',
    port: 45233,
    ...requestOptions
  })
    .then((socket) => {
      const chunks = []

      socket.setEncoding('utf8')
      socket.on('data', (chunk) => {
        chunks.push(chunk)
      })
      socket.on('end', () => {
        if (socket.authorized === true) {
          resolve(chunks.join(''))
        } else {
          reject(socket.authorizationError)
        }
      })
      socket.on('error', (e) => {
        reject(e)
      })
    })
})

module.exports = client
