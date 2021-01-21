const tls = require('tls')
const loadKey = require('../loadKey')
const getCAHKeyPath = require('../getCAHKeyPath')
const cahkeyIsPresent = require('../cahkeyIsPresent')

module.exports = async (a1, a2) => {
  const {
    cahKeysDir,
    cahCheckKeyExists,
    ...receivedOptions
  } = (typeof a1 === 'object')
    ? a1
    : {}
  const keyPath = await getCAHKeyPath('server', { cahKeysDir })
  const keyOptions = await loadKey(keyPath)
  const options = {
    ...receivedOptions,
    ...keyOptions,
    requestCert: true,
    rejectUnauthorized: true
  }
  const requestHandler = (typeof a1 === 'function') ? a1 : a2

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
