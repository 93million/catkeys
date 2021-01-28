const { testCahkeysDir } = require('../../filepaths')
const { https } = require('../../..')

const request = (requestOptions = {}) => new Promise((resolve, reject) => {
  https.request(
    {
      cahKeysDir: testCahkeysDir,
      hostname: 'localhost',
      method: 'GET',
      port: 45231,
      ...requestOptions
    },
    (res) => {
      resolve(res.statusCode)
    }
  )
    .then((req) => {
      req.on('error', reject)
      req.end()
    })
})

module.exports = request
