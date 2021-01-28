const tls = require('tls')
const loadKey = require('./loadKey')
const getCatKeyPath = require('./getCatKeyPath')

const createSecureContext = async (_options = {}) => {
  const {
    catKey,
    catKeysDir,
    ...receivedOptions
  } = _options
  const keyPath = await getCatKeyPath(catKey, { catKeysDir })
  const keyOptions = await loadKey(keyPath)

  return tls.createSecureContext({
    ...receivedOptions,
    ...keyOptions
  })
}

module.exports = createSecureContext
