const { tls } = require('catkeys')

const serve = async () => {
  (await tls.createServer(
    (socket) => {
      console.log('Client connected.')
      console.log('Text entered here will be send to stdout on the client')

      socket.write('Connected to server.\n')
      socket.write('Text entered here will be send to stdout on the server\n')

      socket.pipe(process.stdout)
      process.stdin.pipe(socket)
    }
  )).listen(1444)
}

serve()
