// in your own project you should use:
//     const clientAuthenticatedHttps = require('client-authenticated-https')
const clientAuthenticatedHttps = require('..')

const request = async () => {
  const postData = 'Dibber Dobber!!! Bimble Bomble!!!'

  const req = await clientAuthenticatedHttps.request(
    {
      hostname: 'localhost',
      method: 'POST'
    },
    (res) => {
      const data = []

      res.on('data', (chunk) => {
        data.push(chunk)
      })

      res.on('end', () => {
        console.log(data.join(''))
      })
    }
  )

  req.write(postData)
  req.end()
}

request()
