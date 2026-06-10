# Guided Scenario Bridge

This bridge maps guided scenario steps to existing Packet Atlas journey stages.

- **HTTPS happy path** / Intent starts the journey -> `url-intent`
- **HTTPS happy path** / Name becomes destination -> `dns-query`
- **HTTPS happy path** / Transport and protection appear -> `tcp-handshake / tls-handshake`
- **HTTPS happy path** / Response becomes visible -> `browser-render`
- **DNS failure** / DNS question exists -> `dns-query`
- **DNS failure** / DNS answer fails -> `dns-response`
- **DNS failure** / Later layers are absent -> `dns-response -> no tcp/tls/http`
- **TCP blocked** / Destination is known -> `dns-response`
- **TCP blocked** / TCP does not open -> `tcp-handshake`
- **TLS failure** / TCP exists -> `tcp-handshake`
- **TLS failure** / TLS breaks -> `tls-handshake`
- **HTTP/application error** / Earlier layers worked -> `tls-handshake`
- **HTTP/application error** / Application evidence matters -> `http-response / app`
