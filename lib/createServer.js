const https = require('https')
const loadKey = require('./loadKey')
const getCAHKeyPath = require('./getCAHKeyPath')

module.exports = async (a1, a2) => {
  const {
    cahKeysDir,
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
    requestHandler
  )
}
