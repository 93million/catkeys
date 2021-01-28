const loadKey = require('./loadKey')
const getCatKeyPath = require('./getCatKeyPath')

module.exports = async (_options = {}) => {
  const {
    catKey,
    catKeysDir,
    ...receivedOptions
  } = _options
  const keyPath = await getCatKeyPath('server', { catKeysDir })
  const keyOptions = await loadKey(keyPath)

  return {
    ...receivedOptions,
    ...keyOptions,
    requestCert: true,
    rejectUnauthorized: true
  }
}
