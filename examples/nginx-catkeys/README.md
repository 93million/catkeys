# Example: CATKeys behind Nginx TLS termination

The following steps are required to demonstrate CATKeys behind an Nginx server.

Run the following commands from the directory containing this readme (`examples/nginx-catkeys`)

## Extract server.catkey

Extract the CATKeys server key to the `examples/nginx-catkeys/tls` directory

```
npx catkeys extract-key ../catkeys/server.catkey
```

## Start Nginx

```
nginx -p `pwd` -c nginx.conf
```

## Start the Node server

```
node serve.js
```

## Make the request

From another terminal (remember to `cd` to the same directory - `examples/nginx-catkeys`)

```
node request.js
```

The request body will appear appear on the console:

```
$ node request.js
Hello from CATKeys behind Nginx TLS termination
```

## Stopping Nginx

```
nginx -p `pwd` -c nginx.conf -s stop
```
