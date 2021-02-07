const https = require('https')
const createSecureContext = require('../createSecureContext')
const checkServerIdentity = require('../checkServerIdentity')

module.exports = async (options = {}) => {
  const { catIgnoreMismatchedHostName } = options

  return new https.Agent({
    checkServerIdentity: (host, cert) => {
      return checkServerIdentity(
        host,
        cert,
        { catIgnoreMismatchedHostName }
      )
    },
    secureContext: await createSecureContext(options)
  })
}
