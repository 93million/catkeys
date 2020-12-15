const clientAuthenticatedHttps = require('../../clientAuthenticatedHttps')

let srv

const start = async (options = {}) => {
  srv = await clientAuthenticatedHttps.createServer(
    options,
    (req, res) => {
      const data = []

      req.on('data', (chunk) => {
        data.push(chunk)
      })
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/html' })
        res.end()
      })
    }
  )

  srv.listen(45231)
}

const stop = () => {
  srv.close()
}

module.exports = { start, stop }
