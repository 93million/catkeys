const getOptionsArgFromArgs = require('./lib/getOptionsArgFromArgs')
const createServer = require('./lib/https/createServer')
const request = require('./lib/https/request')

const catHttps = {
  createServer,
  get (...args) {
    const [options, _args] = getOptionsArgFromArgs(args)

    options.method = 'GET'

    return this.request(..._args)
  },
  request
}

module.exports = catHttps
