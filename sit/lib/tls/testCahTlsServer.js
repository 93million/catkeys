const tls = require('../../../tls')

module.exports = async ({ port = 45233, ...options } = {}) => {
  const srv = await tls.createServer(
    options,
    (socket) => {
      socket.write('Hello from CAT')
      socket.end()
    }
  )

  srv.listen(port)

  return () => {
    srv.close()
  }
}
