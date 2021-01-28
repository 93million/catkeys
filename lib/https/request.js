const https = require('https')
const createSecureContext = require('../createSecureContext')
const checkServerIdentity = require('../checkServerIdentity')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs.js')

module.exports = async (...args) => {
  const [options, _args] = getOptionsArgFromArgs(args)
  const { catIgnoreMismatchedHostName } = options
  const agent = new https.Agent({
    checkServerIdentity: (host, cert) => {
      return checkServerIdentity(
        host,
        cert,
        { catIgnoreMismatchedHostName }
      )
    }
  })

  options.secureContext = await createSecureContext(options)
  options.agent = agent

  return https.request(..._args)
}
