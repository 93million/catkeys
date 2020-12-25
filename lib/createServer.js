const https = require('https')
const loadKey = require('./loadKey')
const getCAHKeyPath = require('./getCAHKeyPath')
const cahkeyIsPresent = require('./cahkeyIsPresent')

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

  return https.createServer(
    (typeof a1 === 'object') ? { ...a1, ...options } : options,
    async (req, res) => {
      if (
        cahCheckKeyExists === true &&
        await cahkeyIsPresent(
          req.connection.getPeerCertificate(),
          { cahKeysDir }
        ) === false
      ) {
        res.writeHead(403, 'Forbidden')
        res.write('cahkey not present on disk')
        res.end()
      } else {
        requestHandler(req, res)
      }
    }
  )
}
