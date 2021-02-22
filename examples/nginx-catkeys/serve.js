const http = require('http')

const serve = () => {
  http.createServer(
    (req, res) => {
      res.writeHead(200)
      res.write('Hello from CATKeys behind Nginx TLS termination')
      res.end()
    }
  ).listen(8081)
}

serve()
