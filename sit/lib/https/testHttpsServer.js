const https = require('https')

module.exports = (options = {}) => {
  const srv = https.createServer(
    options,
    (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/html' })
      res.end()
    }
  )

  srv.listen(45232)

  return () => { srv.close() }
}
