const tls = require('tls')
const config = require('../config')

const checkServerIdentity = (
  host,
  cert,
  { catRejectMismatchedHostname = false } = {}
) => {
  const tlsErr = tls.checkServerIdentity(host, cert)

  if (
    tlsErr !== undefined &&
    tlsErr.code === 'ERR_TLS_CERT_ALTNAME_INVALID'
  ) {
    if (
      catRejectMismatchedHostname === false &&
      config.server.validCommonNames.includes(cert.subject.CN)
    ) {
      return
    }

    if (
      catRejectMismatchedHostname === true &&
      config.server.validCommonNames.includes(cert.subject.CN)
    ) {
      const err = new Error([
        'Unable to connect using \'catRejectMismatchedHostname: true\'',
        'as server key contains no name'
      ].join(' '))

      err.code = tlsErr.code

      return err
    }
  }

  return tlsErr
}

module.exports = checkServerIdentity
