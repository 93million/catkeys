const tls = require('tls')

const checkServerIdentity = (
  host,
  cert,
  { cahIgnoreMismatchedHostName = false } = {}
) => {
  const tlsErr = tls.checkServerIdentity(host, cert)

  if (
    tlsErr !== undefined &&
    tlsErr.code === 'ERR_TLS_CERT_ALTNAME_INVALID' &&
    cahIgnoreMismatchedHostName === true
  ) {
    return
  }

  return tlsErr
}

module.exports = checkServerIdentity
