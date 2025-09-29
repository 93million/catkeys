/* global jest test expect */

const createHttpsCert = require('./createHttpsCert')
const fs = require('fs')
const fileExists = require('../fileExists')

jest.mock('fs')
jest.mock('../fileExists')
jest.mock('./createTLSCa')
jest.mock('./createTLSKey')
jest.mock('./createTLSCert')

fs.mkdir.mockImplementation((path, callback) => { callback(null) })

test(
  'should create directory if none exists',
  async () => {
    fileExists.mockReturnValueOnce(Promise.resolve(false))

    await createHttpsCert({})

    expect(fs.mkdir).toHaveBeenCalledTimes(1)
  }
)

test(
  'should not create directory if already exists',
  async () => {
    fileExists.mockReturnValueOnce(Promise.resolve(true))

    await createHttpsCert({})

    expect(fs.mkdir).not.toHaveBeenCalled()
  }
)
