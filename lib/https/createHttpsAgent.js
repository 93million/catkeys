const https = require('https')
const createSecureContext = require('../createSecureContext')
const checkServerIdentity = require('../checkServerIdentity')

module.exports = async (options = {}) => {
  const { catRejectMismatchedHostname } = options

  return new https.Agent({
    checkServerIdentity: (host, cert) => {
      return checkServerIdentity(
        host,
        cert,
        { catRejectMismatchedHostname }
      )
    },
    secureContext: await createSecureContext(options)
  })
}
