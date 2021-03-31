<div align="right"><img src="docs/images/93million_logo.svg" alt="93 Million Ltd. logo" height="36" /></div>
<div align="center"><img src="docs/images/catkeys_logo.svg" alt="CATKeys logo" height="270" /></div><br />

![Node.js CI](https://github.com/93million/catkeys/workflows/Node.js%20CI/badge.svg)

# CATKeys

*TLS/SSL encryption using client certificates for mutual authentication*

## What is CATKeys?

CATKeys is a [Node.JS](https://nodejs.org/) library. It is an implementation of TLS/SSL client certificates for mutual authentication. It is useful when you want to guarantee that only authenticated clients can communicate with a server using HTTPS or a TLS connection, to protect things like private web services only intended for use by privilledged clients.

Mutual authentication means that clients will only connect to valid servers; while servers will only allow valid clients to connect. Authentication takes place in the TLS/SSL protocol and is invisible to your codebase. This means there is no authentication to handle as a developer - if you are receiving the request then both the server and client have been validated by each other.

The complexities of generating private keys, certificates and CAs are taken care of by simple commands. Keys are packaged as single files that can be easily placed on a client in order to grant access to a server.

Generate server and client keys, then use this library as a drop in replacement anywhere you have used `https.createServer()`, `https.request()`, `tls.createServer()` or `tls.connect()`.

CATKeys is open source under the MIT license and has good coverage with unit tests and integration tests.

## Getting started

All commands must be run from your project root that contains your `package.json`

### Requirements

 - OpenSSL (which is included in most distributions). [See here](docs/Windows%20support.md) for instructions installing OpenSSL on Windows.
 - Node v12 or later

### Installing CATKeys

```
npm install --save catkeys
```

### Creating keys

A server key must be generated first. Client keys are generated from the server key.

#### Generating a server key

The following command generates a server key named `server.catkey` in a directory named `catkeys`:

```
npx catkeys create-key --server --keydir catkeys
```

#### Generating client keys

```
npx catkeys create-key --keydir catkeys
```

> ⚠️ Creating a new server key will invalidate all client keys as clients keys are created from server keys. Server keys can be updated (using `create-key --server --update`) so that client keys remain valid.

Take a look in your `catkeys` directory - you will now see `client.catkey` and `server.catkey`

```
$ ls -l catkeys
total 32
-rw-r--r--  1 pommy  staff  5372  4 Sep 21:10 client.catkey
-rw-r--r--  1 pommy  staff  7857  4 Sep 21:09 server.catkey
```

### Using CATKeys with HTTPS

The `catkeys` library exports an object named `https` which includes `.request()` and `.createServer()` methods. These methods have the same signature as they do in Node's `https` library, however an important difference is that they are `async` methods.

See the node documentation for information about how to use these methods:

* https://nodejs.org/api/https.html#https_https_request_options_callback
* https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener

#### Creating a server

```javascript
const { https } = require('catkeys')

const serve = async () => {
  (await https.createServer(
    (req, res) => {
      res.writeHead(200)
      res.write('Hello from CATKeys over HTTPS')
      res.end()
    }
  )).listen(8000)
}

serve()
```

#### Creating a client

Ensure the `client.catkey` is present in the `catkeys` directory in the project root of the client.

```javascript
const { https } = require('catkeys')

const request = async () => {
  const req = await https.request(
    'https://localhost:8000',
    (res) => {
      const data = []

      res.on('data', (chunk) => { data.push(chunk) })
      res.on('end', () => { console.log(data.join('')) })
      res.on('error', console.error)
    }
  )

  req.end()
}

request()
```

### Using CATKeys over a TLS connection

The `catkeys` exports an object named `tls` which includes `.connect()` and `.createServer()` methods. These methods have the same signature as they do in Node's `tls` library, however an important difference is that they are `async` methods.

See the node documentation for information about how to use these methods:

* https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
* https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener

#### Creating a server

```javascript
const { tls } = require('catkeys')

const serve = async () => {
  (await tls.createServer(
    (socket) => {
      console.log('Client connected.')
      socket.write('Hello from CATKeys over TLS\n')
      socket.end()
    }
  )).listen(1444)
}

serve()
```

#### Creating a client

Ensure the `client.catkey` is present in the `catkeys` directory in the project root of the client.

```javascript
const { tls } = require('catkeys')

const connect = async () => {
  const socket = await tls.connect(
    { host: 'localhost', port: 1444 },
    () => {
      socket.pipe(process.stdout)
    }
  )
}

connect()
```

### Revoking access to a client

There are 2 ways to revoke access to a client.

#### Revoking client keys that you have access to

If you still have access to the client key that you want to revoke in your `catkeys` directory, you can revoke the key using the `revoke-key` cli command.

For example, if you created a key named `client-to-revoke` like this:

```
npx catkeys create-key --keydir catkeys --name client-to-revoke
```

then you can revoke it like this:

```
npx catkeys revoke-key --keydir catkeys --name client-to-revoke
```

#### Revoking client keys that you no longer have access to

If you no longer have access to the client key that you want to revoke in your `catkeys` directory, you can effectively revoke it by limiting access to only the keys that exist in the `catkeys` directory, by passing the option `catCheckKeyExists: true` when calling `createServer()`:

```javascript
(await https.createServer(
  { catCheckKeyExists: true },
  (req, res) => {
    …
  }
)).listen(8000)
```

## Examples

The [examples/](examples/) directory contains working examples for [HTTPS](examples/https/) requests and [TLS](examples/tls/) sockets, along with examples showing how to use CATKeys with libraries such as:

- [Axios](examples/axios/)
- [Express](examples/express/)
- [JsonSocket](examples/json-socket/)

## Configuration options

### Multiple client keys

Client keys are named `client` by default. To create multiple client CATKeys you will need to give them a name:

```
npx catkeys create-key --keydir catkeys --name myotherclient
```

This command will create a key named `myotherclient.catkey`.

If there is more than 1 client key in a client's `catkeys` directory, you will need to be specifiy which one to use when calling `request()` or `connect()` by setting the option `catKey`. Eg:

```javascript
const { https } = require('catkeys')

const req = await https.request(
  'https://localhost:8000/',
  {
    catKey: 'myotherclient'
  },
  (res) => { … }
)
```

Alternatively you can use the env var `CAT_KEY_NAME` which is used if the `catKey` option is not provided.

Server keys are always named `server.catkey` and it is not possible to have multiple server keys.

### Alternative `catkeys` directory

If the `catkeys` directory is in another location other than the project root (or has a name other than `catkeys`), it can be specified when calling `request()`, `connect()` or `createServer()` using the option `catKeysDir`. Eg:

```javascript
(await https.createServer(
  {
    catKeysDir: path.resolve(__dirname, '..', 'my_catkeys_dir')
  },
  (req, res) => {
    …
  }
)).listen(443)
```

Alternatively you can use the env var `CAT_KEYS_DIR` which is used if the `catKeysDir` option is not provided.

## Using CATKeys with servers other than Node

CATKeys archives can be extracted so that administrators can gain access to the certificates and keys required to secure servers that are not running Node (such as Nginx and Tomcat). This can be useful if you are not running Node on the server, or if another server is being used to terminate TLS and proxy the request to Node.

See the document [using keys with other servers](./docs/Using%20keys%20with%20other%20servers.md) for information on how to use CATKeys with other servers.

## API

### catkeys.https

#### catkeys.https.createServer()

Uses the same signature as Node's [https.createServer()](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) with the following added options:

#### catkeys.tls.createServer()

Uses the same signature as Node's [tls.createServer()](https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener) with the following added options:

- `catKeysDir` (string):  path to the catKeys directory if not present at `<project root>/catkeys`
- `catCheckKeyExists` (boolean) default `false`:  whether to check that client's key is present on server before handling the request. This allows you to block clients by deleting their key from the server's `catkeys` directory

#### catkeys.https.request()

Uses the same signature as Node's [https.request()](https://nodejs.org/api/https.html#https_https_request_options_callback) with the following added options:

#### catkeys.https.get()

Uses the same signature as Node's [https.get()](https://nodejs.org/api/https.html#https_https_get_options_callback) with the following added options:

#### catkeys.tls.connect()

Uses the same signature as Node's [tls.connect()](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback) with the following added options:

Options:

- `catKey` (string): name of the catkey to use (filename without `.catkey` ext)
- `catKeysDir` (string):  path to the catKeys directory if not present at `<project root>/catkeys`
- `catRejectMismatchedHostname` (boolean) default `false`: server hostnames can be safely ignored as validation is performed using the client key. Set this value to `true` to cause an error to be thrown when the server hostname doesn't match the common name of it's key (server key common name can be set when creating key with args `--server --name <hostname>`)

### Command line usage

Invoke cli using npx to see command line usage

```
$ npx catkeys --help
```

#### create-key

```
$ npx catkeys create-key
```

Options:

- `--name, -n`: common name of client/server key
- `--server, -s`: generate a server key
- `--force, -f`: overwrite existing server keys when creating (will invalidate client keys)
- `--update, -u`: update server key (client keys remain valid)
- `--keydir, -k`: path to catkeys dir (will search project root by default)


#### extract-key

```
$ npx catkeys extract-key [path]
```

Options:

- `[path]`: path to key file
- `--output-dir, -o`: path to the directory to output the key files

---------

## Tests

Run unit tests:

```
npm run test:unit
```

Run integration tests:

```
npm run test:sit
```

Run all tests:

```
npm test
```

## License and copyright

All logos, images and artwork are copyright 93 Million Ltd. and used by permission for this project only.

Code is released under the [MIT](LICENSE) license


*Copyright 93 Million Ltd. All rights reserved*

<div align="center"><img src="docs/images/93million_logo.svg" alt="93 Million Ltd. logo" height="60" /></div>
