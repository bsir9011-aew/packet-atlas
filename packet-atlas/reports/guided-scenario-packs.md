# Packet Atlas Guided Scenario Packs

Scenario packs are guided reading blueprints, not dashboard panels.

## HTTPS happy path

**User symptom:** User enters a URL and the page loads.

**Notebook:** Intent -> DNS -> TCP -> TLS -> HTTP -> server -> render.

## DNS failure

**User symptom:** Browser cannot resolve the name.

**Notebook:** DNS query exists, no usable destination exists, TCP/TLS/HTTP never start.

## TCP blocked

**User symptom:** Name resolves, but connection hangs or is refused.

**Notebook:** Destination known, transport cannot open.

## TLS failure

**User symptom:** Secure connection or certificate problem.

**Notebook:** TCP exists, but secure envelope fails before HTTP is useful.

## HTTP/application error

**User symptom:** Page returns an application error.

**Notebook:** Earlier layers worked; now app evidence matters.
