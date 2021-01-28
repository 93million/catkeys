const catkeys = require('catkeys')

const request = async () => {
  const postData = 'Dibber Dobber!!! Bimble Bomble!!!'

  const req = await catkeys.request(
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
