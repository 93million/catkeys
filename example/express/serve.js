const { https } = require('catkeys')
const express = require('express')

const serve = async () => {
  const app = express()
  const port = 1445

  app.get('/', function (req, res) {
    res.send('Hello from Express')
  });

  (await https.createServer(app)).listen(port)
  console.log(`Express started on port ${port}`)
}

serve()
