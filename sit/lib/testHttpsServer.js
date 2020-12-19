const https = require('https')

let srv

const start = (options = {}) => {
  srv = https.createServer(
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

  srv.listen(45232)
}

const stop = () => {
  srv.close()
}

module.exports = { start, stop }
