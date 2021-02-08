# Using CATKeys in Windows

CATKeys has been tested in Windows 10 running in Node 12.16.2.

OpenSSL must be required and available in the PATH.

OpenSSL can be installed using (Chocolately)[https://chocolatey.org/]. After installing Chocolatey, run the command:

```
choco install openssl
```

> NB this command may have to be run from a command prompt running as administrator

You can validate installation has been sucessful by running the following command from the command prompt:

```
openssl version
```

You should see the version number of OpenSSL outputted.

eg:

```
C:\Users\pommy>openssl version
OpenSSL 1.1.1i  8 Dec 2020
```
