/* global jest test expect */

const loadCert = require('./loadCert')
const tls = require('tls')

jest.mock('tls')

const mockCert = 'mock_cert'

test(
  'should generate a certificate using tls.TLSSocket',
  () => {
    const getCertificate = jest.fn()

    tls.TLSSocket.mockReturnValue({ getCertificate })

    loadCert(mockCert)
    expect(getCertificate).toHaveBeenCalled()
  }
)
