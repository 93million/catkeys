const catkeys = require('catkeys')

const serve = async () => {
  (await catkeys.createServer(
    { catCheckKeyExists: true },
    (req, res) => {
      const data = []

      req.on('data', (chunk) => {
        data.push(chunk)
      })
      req.on('end', () => {
        const response = `Data received: ${data.join('')}`

        res.writeHead(200, { 'Content-Type': 'application/html' })
        res.write(response)
        res.end()
      })
    }
  )).listen(1443)
}

serve()
