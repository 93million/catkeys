const { https } = require('catkeys')

const request = async () => {
  const postData = 'Hello from CATKeys over HTTPS!'

  const req = await https.request(
    {
      hostname: 'localhost',
      method: 'POST',
      port: 1443
    },
    (res) => {
      const data = []

      res.on('data', (chunk) => {
        data.push(chunk)
      })

      res.on('end', () => {
        console.log(data.join(''))
      })

      res.on('error', (message) => {
        console.error(message)
      })
    }
  )

  req.write(postData)
  req.end()
}

request()
