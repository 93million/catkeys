/* global jest beforeEach test expect */

const getOptionsArgFromArgs = require('./getOptionsArgFromArgs')

let mockOptions
const mockHost = 'localhost'
const mockPort = 1234
const mockCallback = jest.fn()

beforeEach(() => {
  mockOptions = {
    mock: 'option',
    items: 'here'
  }
})

test(
  'should get options when provided as only argument',
  () => {
    expect(getOptionsArgFromArgs([mockOptions])).toEqual(mockOptions)
  }
)

test(
  'should get options with args: host, options',
  () => {
    expect(getOptionsArgFromArgs([mockHost, mockOptions])).toEqual(mockOptions)
  }
)

test(
  'should get options with args: host, port, options',
  () => {
    expect(getOptionsArgFromArgs([mockHost, mockPort, mockOptions]))
      .toEqual(mockOptions)
  }
)

test(
  'should get options with args: host, options, callback',
  () => {
    expect(getOptionsArgFromArgs([mockHost, mockOptions, mockCallback]))
      .toEqual(mockOptions)
  }
)

test(
  'should create empty option object if not present in args',
  () => {
    expect(getOptionsArgFromArgs([mockHost, mockCallback])).toEqual({})
  }
)

test(
  // eslint-disable-next-line max-len
  'should provide reference to the composed options object so it can be mutated within the args',
  async () => {
    const origOptions = { ...mockOptions }
    const options = await getOptionsArgFromArgs([mockOptions])

    options.woo = 'paa'

    expect(options).toEqual({ ...origOptions, woo: 'paa' })
  }
)

test(
  'should inject options when args are empty',
  async () => {
    const args = []
    const options = await getOptionsArgFromArgs(args)

    expect(args).toEqual([options])
  }
)

test(
  'should inject options at end when args doesn\'t contain callback',
  async () => {
    const args = [mockHost, mockPort]
    const options = await getOptionsArgFromArgs(args)

    expect(args[args.length - 1]).toEqual(options)
  }
)

test(
  'should inject options at penultimate position when args contains callback',
  async () => {
    const args = [mockHost, mockPort, mockCallback]
    const options = await getOptionsArgFromArgs(args)

    expect(args[args.length - 2]).toEqual(options)
  }
)
