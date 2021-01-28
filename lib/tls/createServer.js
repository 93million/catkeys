const tls = require('tls')
const catkeyIsPresent = require('../catkeyIsPresent')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs')
const createServerOptions = require('../createServerOptions')

module.exports = async (...args) => {
  let [options] = getOptionsArgFromArgs(args)
  const { catKeysDir, catCheckKeyExists, ...receivedOptions } = options
  const requestHandler = args.find((arg) => (typeof arg === 'function'))

  options = { ...receivedOptions, ...await createServerOptions(options) }

  return tls.createServer(
    options,
    async (socket) => {
      if (
        catCheckKeyExists === true &&
        await catkeyIsPresent(
          socket.connection.getPeerCertificate(),
          { catKeysDir }
        ) === false
      ) {
        socket.write('catkey not present on disk')
        socket.end()
        // TODO test to make sure connections added using
        // `server.on('secureConnect')` are not handled
      } else {
        if (requestHandler !== undefined) {
          requestHandler(socket)
        }
      }
    }
  )
}
