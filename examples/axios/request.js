const { https } = require('catkeys')
const axios = require('axios')

const request = async () => {
  const response = await axios.post(
    'https://localhost:1446/',
    'Hello from Axios!',
    { httpsAgent: await https.createHttpsAgent() }
  )

  console.log(response.data)
}

request()
