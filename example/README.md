# Example catkeys client and server

Steps to see this example working:

* Change to the example directory (`cd /path/to/catkeys/example`)
* Install dependencies (`npm install`)
* Generate the server key: `npx catkeys create-key --keydir catkeys --server`
* Generate the client key: `npx catkeys create-key --keydir catkeys`
* In one terminal instance, run the server `CAT_KEYS_DIR=catkeys npm run serve`
* In another terminal instance, make the request `CAT_KEYS_DIR=catkeys npm run request`

You should see the response from the server printed in the terminal when making the request:

```
$ npm run request

> cat-demo@1.0.0 request /…/catkeys/example
> node request.js

Data received: Dibber Dobber!!! Bimble Bomble!!!
```
