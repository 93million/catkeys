const { tls } = require('catkeys')

const connect = async () => {
  const socket = await tls.connect(
    { host: 'localhost', port: 1444 },
    () => {
      socket.pipe(process.stdout)
      process.stdin.pipe(socket)
    }
  )
}

connect()
