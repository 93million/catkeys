const https = require('../../../https')

module.exports = async ({ port = 45231, ...options } = {}) => {
  const srv = await https.createServer(
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

  srv.listen(port)

  return () => {
    srv.close()
  }
}
