const { tls } = require('catkeys')

const serve = async () => {
  (await tls.createServer(
    (socket) => {
      socket.pipe(process.stdout)
      process.stdin.pipe(socket)
    }
  )).listen(1444)
}

serve()
