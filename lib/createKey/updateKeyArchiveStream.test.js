/* global test expect */

const updateKeyArchiveStream = require('./updateKeyArchiveStream')
const tar = require('tar-stream')
const zlib = require('zlib')
const { Readable } = require('stream')

const createArchiveStream = (archiveContents) => {
  const gzip = zlib.createGzip()
  const pack = tar.pack()

  Object.keys(archiveContents).forEach((name) => {
    pack.entry({ name }, archiveContents[name])
  })
  pack.finalize()

  return pack.pipe(gzip)
}
const expandArchiveStream = async (stream) => {
  const gunzip = zlib.createGunzip()
  const extract = tar.extract()
  const archiveContents = {}

  extract.on('entry', (header, entryStream, callback) => {
    const chunks = []

    entryStream.on('data', (chunk, encoding, callback) => {
      chunks.push(chunk)
    })
    entryStream.on('end', () => {
      archiveContents[header.name] = chunks.join('')
      callback()
    })
  })

  stream.pipe(gunzip).pipe(extract)

  await new Promise((resolve) => {
    extract.on('finish', () => {
      resolve()
    })
  })

  return archiveContents
}

test(
  'should update provided archived entries',
  async () => {
    const mockArchiveStream = createArchiveStream({
      file1: 'file 1 contents',
      file2: 'file 2 contents'
    })
    const updatedFile1 = 'updated file 1'
    const updatedArchive = await updateKeyArchiveStream(
      mockArchiveStream,
      { file1: updatedFile1 }
    )

    expect(await expandArchiveStream(updatedArchive))
      .toMatchObject({ file1: updatedFile1 })
  }
)

test(
  'should not update entries not provided',
  async () => {
    const mockArchiveStream = createArchiveStream({
      file1: 'file 1 contents',
      file2: 'file 2 contents'
    })
    const updatedFile1 = 'updated file 1'
    const updatedArchive = await updateKeyArchiveStream(
      mockArchiveStream,
      { file1: updatedFile1 }
    )

    expect(await expandArchiveStream(updatedArchive))
      .toMatchObject({ file2: 'file 2 contents' })
  }
)

test(
  'should output errors during tar extract',
  async () => {
    const invalidTarArchive = new Readable()

    invalidTarArchive.push('invalid tar archive')
    invalidTarArchive.push(null)

    await expect(updateKeyArchiveStream(
      invalidTarArchive.pipe(zlib.createGzip()),
      { file1: 'test' }
    ))
      .rejects
      .toThrow('Unexpected end of data')
  }
)

test(
  'should output errors during gzip decompression',
  async () => {
    const invalidTarArchive = new Readable()

    invalidTarArchive.push('invalid gzip')
    invalidTarArchive.push(null)

    await expect(updateKeyArchiveStream(
      invalidTarArchive,
      { file1: 'test' }
    ))
      .rejects
      .toThrow('incorrect header check')
  }
)
