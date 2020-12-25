/* global jest test expect */

const loadAllKeys = require('./loadAllKeys')
const fs = require('fs')
const loadKey = require('./loadKey')
const path = require('path')

jest.mock('fs')
jest.mock('./loadKey')

const mockDirItems = ['client.cahkey', 'server.cahkey', 'other.cahkey']
const mockCahkeysDir = '/path/to/cahkeys'

fs.readdir.mockImplementation((dir, callback) => {
  callback(null, mockDirItems)
})

test(
  'should load all keys in directory',
  async () => {
    await loadAllKeys(mockCahkeysDir)

    mockDirItems.forEach((dirItem) => {
      expect(loadKey).toBeCalledWith(path.resolve(mockCahkeysDir, dirItem))
    })
  }
)
