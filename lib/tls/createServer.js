const tls = require('tls')
const catkeyIsPresent = require('../catkeyIsPresent')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs')
const createServerOptions = require('../createServerOptions')

module.exports = async (...args) => {
  let [options] = getOptionsArgFromArgs(args)
  const { catKeysDir, catCheckKeyExists, ...receivedOptions } = options
  const requestHandler = args.find((arg) => (typeof arg === 'function'))

  options = { ...receivedOptions, ...await createServerOptions(options) }

  const server = tls.createServer(options)
  const origOn = server.on.bind(server)

  server.on = (eventName, listener) => {
    const secureConnectionHandler = async (socket) => {
      if (
        catCheckKeyExists === true &&
        await catkeyIsPresent(
          socket.getPeerCertificate(),
          { catKeysDir }
        ) === false
      ) {
        if (socket.writable === true) {
          socket.end()
        }
      } else {
        listener(socket)
      }
    }
    const handler = (eventName !== 'secureConnection')
      ? listener
      : secureConnectionHandler

    origOn(eventName, handler)
  }

  if (requestHandler !== undefined) {
    server.on('secureConnection', requestHandler)
  }

  return server
}
