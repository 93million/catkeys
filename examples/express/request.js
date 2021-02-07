const { https } = require('catkeys')

const request = async () => {
  const req = await https.request(
    { hostname: 'localhost', port: 1445 },
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

  req.end()
}

request()
