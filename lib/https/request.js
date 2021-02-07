const https = require('https')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs.js')
const createHttpsAgent = require('./createHttpsAgent')

module.exports = async (...args) => {
  const [options, _args] = getOptionsArgFromArgs(args)

  options.agent = await createHttpsAgent(options)

  return https.request(..._args)
}
