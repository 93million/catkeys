/* global jest test expect */

const https = require('./https')
const request = require('./lib/https/request')

jest.mock('./lib/https/request')

const url = 'https://www.example.com/test?url=true'
const opts = { method: 'POST' }
const callback = () => { }

test(
  'should provide .get() as a wrapper for .request()',
  async () => {
    await https.get(url, opts, callback)

    expect(request).toBeCalledWith(url, opts, callback, { method: 'GET' })
  }
)
