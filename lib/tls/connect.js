const tls = require('tls')
const createSecureContext = require('./createSecureContext')
const checkServerIdentity = require('../checkServerIdentity')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs.js')

module.exports = async (...args) => {
  const options = getOptionsArgFromArgs(args)
  const { cahIgnoreMismatchedHostName } = options

  options.secureContext = await createSecureContext(options)
  options.checkServerIdentity = (host, cert) => {
    return checkServerIdentity(host, cert, { cahIgnoreMismatchedHostName })
  }

  return tls.connect(...args)
}
