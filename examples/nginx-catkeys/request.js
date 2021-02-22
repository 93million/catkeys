const { https } = require('catkeys')

const request = async () => {
  const req = await https.request(
    'https://localhost:8080',
    (res) => {
      const data = []

      res.on('data', (chunk) => { data.push(chunk) })
      res.on('end', () => { console.log(data.join('')) })
      res.on('error', console.error)
    }
  )

  req.end()
}

request()
