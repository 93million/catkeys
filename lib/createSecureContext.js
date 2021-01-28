const tls = require('tls')
const loadKey = require('./loadKey')
const getCAHKeyPath = require('./getCAHKeyPath')

const createSecureContext = async (_options = {}) => {
  const {
    cahKey,
    cahKeysDir,
    ...receivedOptions
  } = _options
  const keyPath = await getCAHKeyPath(cahKey, { cahKeysDir })
  const keyOptions = await loadKey(keyPath)

  return tls.createSecureContext({
    ...receivedOptions,
    ...keyOptions
  })
}

module.exports = createSecureContext
