const { tls } = require('catkeys')
const JsonSocket = require('json-socket')

const serve = async () => {
  const port = 9838
  const server = await tls.createServer()

  server.listen(port)
  server.on('secureConnection', (socket) => {
    socket = new JsonSocket(socket)
    socket.on('message', function (message) {
      const result = message.a + message.b

      socket.sendEndMessage({ result })
    })
  })
}

serve()
