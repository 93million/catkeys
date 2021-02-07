const getOptionsArgFromArgs = require('./lib/getOptionsArgFromArgs')
const createHttpsAgent = require('./lib/https/createHttpsAgent')
const createServer = require('./lib/https/createServer')
const request = require('./lib/https/request')

const catHttps = {
  createHttpsAgent,
  createServer,
  get (...args) {
    const [options, _args] = getOptionsArgFromArgs(args)

    options.method = 'GET'

    return this.request(..._args)
  },
  request
}

module.exports = catHttps
