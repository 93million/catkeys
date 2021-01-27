const { testCahkeysDir } = require('../../filepaths')
const { tls } = require('../../..')

const client = (requestOptions = {}) => new Promise((resolve, reject) => {
  tls.connect({
    cahKeysDir: testCahkeysDir,
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
        resolve(chunks.join(''))
      })
      socket.on('error', reject)
    })
})

module.exports = client
