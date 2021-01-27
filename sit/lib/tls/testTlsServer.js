const tls = require('tls')

module.exports = ({ port = 45234, ...options } = {}) => {
  const srv = tls.createServer(
    options,
    (socket) => {
      socket.write('Hello from HTTPS server')
      socket.end()
    }
  )

  srv.listen(port)

  return () => {
    srv.close()
  }
}
