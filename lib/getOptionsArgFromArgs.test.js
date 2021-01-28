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
    const mockArgs = [mockOptions]

    expect(getOptionsArgFromArgs(mockArgs)).toEqual([mockOptions, mockArgs])
  }
)

test(
  'should get options with args: host, options',
  () => {
    const mockArgs = [mockHost, mockOptions]

    expect(getOptionsArgFromArgs(mockArgs)).toEqual([mockOptions, mockArgs])
  }
)

test(
  'should get options with args: host, port, options',
  () => {
    const mockArgs = [mockHost, mockPort, mockOptions]

    expect(getOptionsArgFromArgs(mockArgs)).toEqual([mockOptions, mockArgs])
  }
)

test(
  'should get options with args: host, options, callback',
  () => {
    const mockArgs = [mockHost, mockOptions, mockCallback]

    expect(getOptionsArgFromArgs(mockArgs)).toEqual([mockOptions, mockArgs])
  }
)

test(
  'should create empty option object if not present in args',
  () => {
    const mockArgs = [mockHost, mockCallback]

    const [options, args] = getOptionsArgFromArgs(mockArgs)

    expect(options).toEqual({})
    expect(args).toEqual([mockHost, {}, mockCallback])
  }
)

test(
  // eslint-disable-next-line max-len
  'should provide reference to the composed options object so it can be mutated within the args',
  () => {
    const mockArgs = [mockOptions]
    const [options, args] = getOptionsArgFromArgs(mockArgs)

    options.woo = 'paa'

    expect(args[0]).toHaveProperty('woo', 'paa')
  }
)

test(
  'should not manipulate the args passed in',
  () => {
    const mockArgs = [mockOptions]
    const [options] = getOptionsArgFromArgs(mockArgs)

    options.woo = 'paa'

    expect(mockArgs[0]).not.toHaveProperty('woo')
  }
)

test(
  'should inject options at end when args doesn\'t contain callback',
  () => {
    const mockArgs = [mockHost, mockPort]
    const [options, args] = getOptionsArgFromArgs(mockArgs)

    expect(args[args.length - 1]).toEqual(options)
  }
)

test(
  'should inject options at penultimate position when args contains callback',
  () => {
    const mockArgs = [mockHost, mockPort, mockCallback]
    const [options, args] = getOptionsArgFromArgs(mockArgs)

    expect(args[args.length - 2]).toEqual(options)
  }
)
