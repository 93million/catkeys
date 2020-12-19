const clientAuthenticatedHttps = require('../..')

let srv

const startServer = async (options = {}) => {
  srv = await clientAuthenticatedHttps.createServer(
    options,
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
  )

  srv.listen(45231)
}

const stopServer = () => {
  srv.close()
}

module.exports = { startServer, stopServer }
