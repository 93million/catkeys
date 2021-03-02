/* global jest beforeEach test expect */

const writeStream = require('./writeStream')
const fs = require('fs')
const { Readable, Writable } = require('stream')

jest.mock('fs')

let mockStream
let mockStreamDataWritten
const mockStreamData = 'foo'
const mockPath = '/path/to/file'

fs.createWriteStream.mockImplementation(() => {
  const mockStreamChunks = []
  const archive = new Writable({
    autoDestroy: true,
    write: (data, encoding, callback) => {
      mockStreamChunks.push(data)
      callback()
    }
  })

  archive.on('finish', () => {
    mockStreamDataWritten = mockStreamChunks.join('')
  })

  return archive
})

beforeEach(() => {
  mockStream = new Readable({ read: () => { } })
  mockStream.push(mockStreamData)
  mockStream.push(null)
})

test(
  'should write stream to file system',
  async () => {
    await writeStream(mockStream, mockPath)
    expect(mockStreamDataWritten).toBe(mockStreamData)
  }
)
