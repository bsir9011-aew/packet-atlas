# HTTPS basic real capture recipe

Goal: capture a tiny, controlled trace matching the Packet Atlas baseline.

Baseline assumptions:

- IPv4
- DNS over UDP/53
- TCP
- TLS 1.3
- HTTP/1.1 model
- no cache
- no service worker
- NAT enabled

Important: modern browsers may use cache, HTTP/2, HTTP/3 or DoH. For a first real fixture, prefer a controlled CLI capture or a local test endpoint where you can constrain behavior.

Suggested workflow:

```bash
node scripts/captures/tshark-export.mjs captures/https-basic.pcapng src/data/fixtures/https-basic.raw.json
node scripts/captures/normalize-fixture.mjs src/data/fixtures/https-basic.raw.json src/data/fixtures/https-basic.real.fixture.json
npm run capture:validate
```

Recommended stage mapping:

| Stage | Expected real frame kind |
|---|---|
| dns-query | DNS query |
| dns-response | DNS response |
| tcp-handshake | TCP SYN/SYN-ACK/ACK |
| tls-handshake | TLS ClientHello / ServerHello |
| http-request | HTTP request if visible at endpoint, otherwise TLS application data |
| http-response | HTTP response if visible at endpoint, otherwise TLS application data |

For public HTTPS, HTTP method/path/body are normally encrypted on the wire. Packet Atlas must not pretend that a network observer can read them unless TLS terminates at an endpoint/proxy.
