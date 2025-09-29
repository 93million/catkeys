/* global jest test expect */

const loadAllKeys = require('./loadAllKeys')
const fs = require('fs')
const loadKey = require('./loadKey')
const path = require('path')

jest.mock('fs')
jest.mock('./loadKey')

const mockDirItems = ['client.catkey', 'server.catkey', 'other.catkey']
const mockCatkeysDir = '/path/to/catkeys'

fs.readdir.mockImplementation((dir, callback) => {
  callback(null, mockDirItems)
})

test(
  'should load all keys in directory',
  async () => {
    await loadAllKeys(mockCatkeysDir)

    mockDirItems.forEach((dirItem) => {
      expect(loadKey).toHaveBeenCalledWith(path.resolve(mockCatkeysDir, dirItem))
    })
  }
)
