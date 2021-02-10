const { tls } = require('catkeys')
const JsonSocket = require('json-socket')

const connect = async () => {
  const port = 9838
  const host = '127.0.0.1'
  const socket = new JsonSocket(await tls.connect({ host, port }))

  socket.on('secureConnect', () => {
    socket.sendMessage({ a: 5, b: 7 })
    socket.on('message', (message) => {
      console.log('The result is: ' + message.result)
    })
  })
}

connect()
