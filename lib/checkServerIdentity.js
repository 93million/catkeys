const tls = require('tls')

const checkServerIdentity = (
  host,
  cert,
  { catIgnoreMismatchedHostName = true } = {}
) => {
  const tlsErr = tls.checkServerIdentity(host, cert)

  if (
    tlsErr !== undefined &&
    tlsErr.code === 'ERR_TLS_CERT_ALTNAME_INVALID' &&
    catIgnoreMismatchedHostName === true
  ) {
    return
  }

  return tlsErr
}

module.exports = checkServerIdentity
