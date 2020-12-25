/* global jest test expect */

const clientAuthenticatedHttps = require('./clientAuthenticatedHttps')
const request = require('./lib/request')

jest.mock('./lib/request')

const url = 'https://www.example.com/test?url=true'
const opts = { method: 'POST' }
const callback = () => { }

test(
  'should provide .get() as a wrapper for .request()',
  async () => {
    await clientAuthenticatedHttps.get(url, opts, callback)

    expect(request).toBeCalledWith(url, opts, callback, { method: 'GET' })
  }
)
