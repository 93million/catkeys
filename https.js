const getOptionsArgFromArgs = require('./lib/getOptionsArgFromArgs')
const createHttpsAgent = require('./lib/https/createHttpsAgent')
const createServer = require('./lib/https/createServer')
const request = require('./lib/https/request')

const catHttps = {
  createHttpsAgent,
  createServer,
  async get (...args) {
    const [options, _args] = getOptionsArgFromArgs(args)

    options.method = 'GET'

    const req = await this.request(..._args)

    req.end()

    return req
  },
  request
}

module.exports = catHttps
