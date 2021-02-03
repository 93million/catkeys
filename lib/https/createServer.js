const https = require('https')
const catkeyIsPresent = require('../catkeyIsPresent')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs')
const createServerOptions = require('../createServerOptions')

module.exports = async (...args) => {
  let [options] = getOptionsArgFromArgs(args)
  const { catKeysDir, catCheckKeyExists, ...receivedOptions } = options
  const requestHandler = args.find((arg) => (typeof arg === 'function'))

  options = { ...receivedOptions, ...await createServerOptions(options) }

  const server = https.createServer(options)
  const origOn = server.on.bind(server)

  server.on = (eventName, listener) => {
    const requestHandler = async (req, res) => {
      if (
        catCheckKeyExists === true &&
        await catkeyIsPresent(
          req.connection.getPeerCertificate(),
          { catKeysDir }
        ) === false
      ) {
        if (res.finished === false) {
          res.writeHead(403, 'Forbidden')
          res.write('catkey not present on disk')
          res.end()
        }
      } else {
        listener(req, res)
      }
    }
    const handler = (eventName !== 'request')
      ? listener
      : requestHandler

    origOn(eventName, handler)
  }

  if (requestHandler !== undefined) {
    server.on('request', requestHandler)
  }

  return server
}
