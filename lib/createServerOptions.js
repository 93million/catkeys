const loadKey = require('./loadKey')
const getCAHKeyPath = require('./getCAHKeyPath')

module.exports = async (_options = {}) => {
  const {
    cahKey,
    cahKeysDir,
    ...receivedOptions
  } = _options
  const keyPath = await getCAHKeyPath('server', { cahKeysDir })
  const keyOptions = await loadKey(keyPath)

  return {
    ...receivedOptions,
    ...keyOptions,
    requestCert: true,
    rejectUnauthorized: true
  }
}
