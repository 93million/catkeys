# Using CATKeys with other servers

CATKeys archives can be extracted so that administrators can gain access to the certificates and keys required to secure servers that are not running Node (such as Nginx and Tomcat). This can be useful if you are not running Node on the server, or if another server is being used to terminate TLS and proxy the request to Node.

The cli interface includes a command `extract-key` which will extract the files contained in a CATKeys archive.

## Extracting a catkey file

```
npx catkeys extract-key /path/to/server.catkey
```

This command will extract the server key to a directory named `server` in the current directory.

```
$ ls -l server/
total 40
-rw-r--r--   1 pommy  staff  2053 21 Feb 22:39 ca-crt.pem
-rw-r--r--   1 pommy  staff  3272 21 Feb 22:39 ca-key.pem
-rw-r--r--   1 pommy  staff  2025 21 Feb 22:39 crt.pem
-rw-r--r--   1 pommy  staff  3243 21 Feb 22:39 key.pem
```

## Configring Nginx to request client keys

Nginx must be configured to request ssl client certificates using the following directives from inside a server block:

```
  server {
    …
    ssl_certificate      /path/to/server/crt.pem;
    ssl_certificate_key /path/to/server/key.pem;
    ssl_client_certificate /path/to/server/ca-crt.pem;
    …
  }
```

An example of using CATKeys with Nginx for TLS termination is provided at [examples/nginx-catkeys](/examples/nginx-catkeys).

Please follow the [README.md](examples/nginx-catkeys/README.md) for information on how to see the example in action.

## Missing fuctionality - restricting client access

When using Node to handle the TLS request, you can restrict access to clients whose keys are exist in the server's `catkeys` directory by passing the option `catCheckKeyExists: true` to CATKey's `createServer()` methods.

However when using another server in front of Node, the request is intercepted before reaching Node, which therefore makes it not possible to restrict access to clients that have keys present in the server's `catkeys` directory.

If you want to use the option `catCheckKeyExists: true` then Node must be configured to handle the client's request directly.
