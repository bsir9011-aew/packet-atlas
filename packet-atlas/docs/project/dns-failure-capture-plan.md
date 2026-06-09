# Packet Atlas v8.7 — DNS Failure Capture Plan

v8.7 adds a safe plan for capturing a real DNS failure later.

It does not commit raw packet captures.

The plan uses `.invalid` as a safe target family and checks the absence of TCP/TLS/HTTP after DNS failure.
