<div align="right">
  <img src="readme/images/93million_logo.svg" alt="93 Million Ltd. logo" height="36" />
</div>

<div align="center">
  <img src="readme/images/cah_logo.svg" alt="Client Authenticated HTTPS logo" height="160" />
</div>

# Client Authenticated HTTPS

*HTTPS communication authenticated using client as well as server SSL certificates*

## What is Client Authenticated HTTPS?

Client Authenticated HTTPS is a [Node.JS](https://nodejs.org/) library. It is useful when you want to guarantee that only authenticated clients can communicate with a server using HTTPS encryption.

Generate keys for both the server and the clients then use this library as a drop-in replacement anywhere you have used `https.request()`, `https.get()`, and `https.createServer()`.

Client keys are single files that can be easily installed by placing in a directory on the client to grant access to the server.

This library is open source under the MIT license and has good coverage with unit tests and integration tests.

## Getting started

### Requirements

`openssl` must be installed and present in your path to generate keys. It is included in most distributions.

Works with Node v12 or later

### Setting up keys

Create a directory named `cahkeys` to hold server and client keys. A good place to put this directory is in your project root directory.

#### Generating a server key

Generate the server key using the command:

```
npx client-authenticated-https create-key --server --keydir /path/to/cahkeys --name <server-hostname>
```

There can be only 1 server key. Running the command again will overwrite any existing server keys.

The value `<server-hostname>` passed to `--name` must noramlly match the host name the clients will use to connect to the server or a connection will not be established. Currently, `<server-hostname>` can only be a single, fixed hostname. Wildcards or alternative names are not currently supported. If you omit `--name` the default name '`localhost`' will be used.

Passing the option `{ cahIgnoreMismatchedHostName: true }` when calling `request()` or `get()` will ignore any mismatch with the host name of the server. Using this option does not invalidate security as the client continues to validate the server using the certificate authority in the client cahkey, just as the server validates the client using the certificate authority in the server key.

Take a look in your `cahkeys` directory - you will now see `server.cahkey`

```
$ ls -la /path/to/cahkeys/
total 16
drwxr-xr-x  3 pommy  staff    96  4 Sep 22:13 .
drwxr-xr-x  9 pommy  staff   288  4 Sep 21:48 ..
-rw-r--r--  1 pommy  staff  7857  4 Sep 21:09 server.cahkey
```

#### Generating client keys

Generate a client key using the command:

```
npx client-authenticated-https create-key --keydir /path/to/cahkeys --name client
```

There can be as many client keys as you require. You can chose to give each client a unique key or share a key between many clients.

If you omit `--name` the default name '`client`' will be used. Unlike the server key, it is not required that the value `<client-name>` passed to `--name` matches any of the network credentials of the client to establish a connection.

**NB: The server key is effectively the master key. All client keys are generated from the server key. If you regenerate the server key you will need to regenerate all the client keys!!! For this reason it may be worth making a secure backup of the server key.**

Take a look in your `cahkeys` directory - you will now see `client.cahkey`

```
$ ls -la cahkeys/
total 32
drwxr-xr-x  4 pommy  staff   128  4 Sep 21:10 .
drwxr-xr-x  9 pommy  staff   288  4 Sep 21:48 ..
-rw-r--r--  1 pommy  staff  5372  4 Sep 21:10 client.cahkey
-rw-r--r--  1 pommy  staff  7857  4 Sep 21:09 server.cahkey
```

You can generate as many client keys as you wish, however if you have more than 1 you will need to specify which to use when making a request.

### Using the library

The API extends Node's `https` with 2 methods overridden: `.request()` and `.createServer()`. Both these methods have the same signature as they do in the `https` library, however an important difference is that they are `async` methods.

See the node documentation for information about how to use these methods:

* https://nodejs.org/api/https.html#https_https_request_options_callback
* https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener

#### Creating a server

Let's review how to migrate the following server, written using the standard `https` library, to `clientAuthenticatedKeys`:

```javascript
const https = require('https')

exports = () => {
  https.createServer(
    {
      cert: fs.readFileSync('/path/to/cert/fullchain.pem'),
      key: fs.readFileSync('/path/to/cert/privkey.pem')
    },
    (req, res) => {
      …
    }
  ).listen(443)
}
```

The following changes need to be made:

* Require `client-authenticated-https` instead of `https`
* `await` on `.createServer()` before chaining the returned value to `.listen(443)`
* Update the enclosing function to use `async` (or alternativly use `clientAuthenticatedHttps.createServer()` as a promise)
* Remove SSL options related to `cert`, `key` and `ca` as these are replaced by the keys generated by `npx client-authenticated-https create-key`

```javascript
const clientAuthenticatedHttps = require('client-authenticated-https')

exports = async () => {
  (await clientAuthenticatedHttps.createServer(
    (req, res) => {
      …
    }
  )).listen(443)
}
```

#### Creating a client

Install the client key on the client:

* Create a directory in your project root named `cahkeys`
* Copy the file `client.cahkey` you created from the server into this directory

*If you want to place the `cahkeys` directory in a custom location, [use an env var](#specifying-a-custom-location-for-the-cahkeys-directory)*

Let's review how to migrate the following request, written using the standard `https` library, to `clientAuthenticatedKeys`:

```javascript
const https = require('https')

exports = () => {
  const req = https.request(
    {
      url: 'https://secure.example.com/',
      …
    },
    (res) => { … }
  )

  req.write(postData)
  req.end()
}
```

The following changes need to be made:

* Require `client-authenticated-https` instead of `https`
* `await` on `.request()` before calling further methods on the returned request object
* Update the enclosing function to use `async` (or alternativly use `clientAuthenticatedHttps.request()` as a promise)
* Optionally specify the name of the cahkey to use to make the request. This is useful if there is more than 1 client key in your `cahkeys` directory. Do not include the `.cahkey` file extension. A cahkey can also be defined by setting the environment variable `CAH_KEY_NAME` (again, without extension).

```javascript
const clientAuthenticatedHttps = require('client-authenticated-https')

exports = async () => {
  const req = await clientAuthenticatedHttps.request(
    {
      url: 'https://secure.example.com/',
      cahkey: 'my-special-key',
      …
    },
    (res) => { … }
  )

  req.write(postData)
  req.end()
}
```

## Examples

Look in `./example/` for a working example of a server and client

## Specifying a custom location for the `cahkeys` directory

The `cahkeys` directory is located by progressing back through the filesystem from the `client-authenticated-https` directory until a `cahkeys` directory is found. You can specify a directory at an alternative location by supplying a path to the directory in the env var `CAH_KEY_DIR`.

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

<div align="center"><img src="readme/images/93million_logo.svg" alt="93 Million Ltd. logo" height="60" /></div>
