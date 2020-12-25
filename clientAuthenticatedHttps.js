const https = require('https')
const createServer = require('./lib/createServer')
const request = require('./lib/request')

const clientAuthenticatedHttps = {
  ...https,
  createServer,
  get (a1, a2, a3) {
    return this.request(a1, a2, a3, { method: 'GET' })
  },
  request
}

module.exports = clientAuthenticatedHttps
