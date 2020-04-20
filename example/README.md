# Example client-authenticated-https client and server

Steps to see this example working:

* Change to the example directory (`cd /path/to/client-authenticated-https/example`)
* Install dependencies (`npm install`)
* Generate the server key: `npx client-authenticated-https create-key --keydir cahkeys --server`
* Generate the client key: `npx client-authenticated-https create-key --keydir cahkeys`
* In one terminal instance, run the server `CAH_KEYS_DIR=cahkeys npm run serve`
* In another terminal instance, make the request `CAH_KEYS_DIR=cahkeys npm run request`

You should see the response from the server printed in the terminal when making the request:

```
$ npm run request

> cah-demo@1.0.0 request /…/client-authenticated-https/example
> node request.js

Data received: Dibber Dobber!!! Bimble Bomble!!!
```
