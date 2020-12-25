const https = require('https')
const loadKey = require('./loadKey')
const getCAHKeyPath = require('./getCAHKeyPath')
const checkServerIdentity = require('./checkServerIdentity')

module.exports = async (a1, a2, a3, optionOverrides = {}) => {
  const {
    cahKey,
    cahKeysDir,
    cahIgnoreMismatchedHostName,
    ...receivedOptions
  } = (typeof a1 === 'object')
    ? a1
    : (typeof a2 === 'object') ? a2 : {}
  const callback = (typeof a2 === 'function') ? a2 : a3
  const keyPath = await getCAHKeyPath(cahKey, { cahKeysDir })
  const keyOptions = await loadKey(keyPath)
  const options = {
    ...receivedOptions,
    ...keyOptions,
    ...optionOverrides,
    agent: new https.Agent({
      checkServerIdentity: (host, cert) => {
        return checkServerIdentity(
          host,
          cert,
          { cahIgnoreMismatchedHostName }
        )
      }
    })
  }

  return (typeof a1 === 'string')
    ? https.request(a1, options, callback)
    : https.request(options, callback)
}
