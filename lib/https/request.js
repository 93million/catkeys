const https = require('https')
const createSecureContext = require('../createSecureContext')
const checkServerIdentity = require('../checkServerIdentity')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs.js')

module.exports = async (...args) => {
  const options = getOptionsArgFromArgs(args)
  const { cahIgnoreMismatchedHostName } = options
  const agent = new https.Agent({
    checkServerIdentity: (host, cert) => {
      return checkServerIdentity(
        host,
        cert,
        { cahIgnoreMismatchedHostName }
      )
    }
  })

  options.secureContext = await createSecureContext(options)
  options.agent = agent

  return https.request(...args)
}
