# Example CatKeys clients and servers

There are several examples given showing how to use CatKeys with various libraries.

Each example includes a server (`serve.js`) and client (`request.js`)

The directories `https` and `tls` contain basic examples and are a good place to start.

* https - shows how to use `catkeys.https` as a replacement for `https` - creating a server with `createServer()` and making a request using `request()`
* tls - shows how to use `catkeys.tls` as a replacement for `tls` - creating a server with `createServer()` and connecting from a client using `connect()`

Examples for the following libraries are included:

* Axios
* Express
* json-socket

Steps:

* Change to the example directory (`cd /path/to/catkeys/examples`)
* Install dependencies (`npm install`)
* Generate the server key: `npx catkeys create-key --keydir catkeys --server`
* Generate the client key: `npx catkeys create-key --keydir catkeys`
* In one terminal instance, run the server for the example you want to run eg. `node https/serve.js`
* In another terminal instance, make the request eg. `node https/request.js`

You should see the response from the server printed in the terminal when making the request:

Eg:

```
$ node https/request.js
Data received: Hello from Catkeys client!
```
