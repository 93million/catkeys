/* global expect jest test  */

const request = require('./request')
const https = require('https')
const createHttpsAgent = require('./createHttpsAgent')

jest.mock('https')
jest.mock('./createHttpsAgent')

const url = 'https://www.example.com/test?url=true'
const opts = { method: 'POST' }
const callback = () => { }
const mockAgent = { mock: 'agent' }

https.request.mockImplementation = () => { }
createHttpsAgent.mockReturnValue(mockAgent)

test(
  'should wrap https.request with url as only arg',
  async () => {
    await request(url)

    expect(https.request).toBeCalledWith(
      url,
      { agent: mockAgent }
    )
  }
)
test(
  'should wrap https.request with options as only arg',
  async () => {
    await request(opts)

    expect(https.request).toBeCalledWith(
      {
        agent: mockAgent,
        ...opts
      }
    )
  }
)
test(
  'should wrap https.request with url and options args',
  async () => {
    await request(url, opts)

    expect(https.request).toBeCalledWith(
      url,
      {
        agent: mockAgent,
        ...opts
      }
    )
  }
)
test(
  'should wrap https.request with url and callback args',
  async () => {
    await request(url, callback)

    expect(https.request).toBeCalledWith(
      url,
      { agent: mockAgent },
      callback
    )
  }
)
test(
  'should wrap https.request with options and callback args',
  async () => {
    await request(opts, callback)

    expect(https.request).toBeCalledWith(
      {
        ...opts,
        agent: mockAgent
      },
      callback
    )
  }
)
test(
  'should wrap https.request with url, options and callback args',
  async () => {
    await request(url, opts, callback)

    expect(https.request).toBeCalledWith(
      url,
      {
        ...opts,
        agent: mockAgent
      },
      callback
    )
  }
)
