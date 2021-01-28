const tls = require('tls')
const cahkeyIsPresent = require('../cahkeyIsPresent')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs')
const createServerOptions = require('../createServerOptions')

module.exports = async (...args) => {
  let [options] = getOptionsArgFromArgs(args)
  const { cahKeysDir, cahCheckKeyExists, ...receivedOptions } = options
  const requestHandler = args.find((arg) => (typeof arg === 'function'))

  options = { ...receivedOptions, ...await createServerOptions(options) }

  return tls.createServer(
    options,
    async (socket) => {
      if (
        cahCheckKeyExists === true &&
        await cahkeyIsPresent(
          socket.connection.getPeerCertificate(),
          { cahKeysDir }
        ) === false
      ) {
        socket.write('cahkey not present on disk')
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
