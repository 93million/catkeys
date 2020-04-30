#! /usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cleanup () {
  rm -f \
    "$KEYDIR/ca-crt.pem" \
    "$KEYDIR/ca-key.pem" \
    "$KEYDIR/crt.pem" \
    "$KEYDIR/key.pem" \
    "$KEYDIR/csr.pem" \
    "$KEYDIR/.srl"
}

trap cleanup SIGHUP SIGINT EXIT

while getopts ":n:k:" o; do
  case "${o}" in
    n)
      COMMON_NAME="${OPTARG}"
      ;;
    k)
      KEYDIR="${OPTARG}"
      ;;
  esac
done
shift $((OPTIND-1))

if [ ! -f "$KEYDIR/server.cahkey" ]; then
  echo "Server key not found. Generate a server key before atttempting to generate a client key" >&2
  exit 1
fi

tar -xzf "$KEYDIR/server.cahkey" -C "$KEYDIR" "ca-crt.pem" "ca-key.pem" ".srl"

openssl genrsa -out "$KEYDIR/key.pem" 4096 2> /dev/null

openssl \
  req \
  -new \
  -subj "/C=GB/ST=Tyne and Wear/L=Newcastle upon Tyne/O=clientAuthenticatedHttps/OU=clientAuthenticatedHttps/CN=$COMMON_NAME" \
  -key "$KEYDIR/key.pem" \
  -out "$KEYDIR/csr.pem" \
  2> /dev/null

openssl \
  x509 \
  -req \
  -days 9999 \
  -in "$KEYDIR/csr.pem" \
  -CA "$KEYDIR/ca-crt.pem" \
  -CAkey "$KEYDIR/ca-key.pem" \
  -out "$KEYDIR/crt.pem" \
  -CAserial "$KEYDIR/.srl" \
  2> /dev/null

tar -czf "$KEYDIR/$COMMON_NAME.cahkey" -C "$KEYDIR" "ca-crt.pem" "crt.pem" "key.pem"
