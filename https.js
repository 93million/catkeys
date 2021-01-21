const https = require('https')
const createServer = require('./lib/https/createServer')
const request = require('./lib/https/request')

const cahHttps = {
  ...https,
  createServer,
  get (a1, a2, a3) {
    return this.request(a1, a2, a3, { method: 'GET' })
  },
  request
}

module.exports = cahHttps