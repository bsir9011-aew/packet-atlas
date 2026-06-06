#!/usr/bin/env bash
set -euo pipefail

# Packet Atlas controlled capture command plan
# Review interface, authorization and assumptions before running.

mkdir -p captures src/data/fixtures reports

echo "1) Inspect available interfaces"
tshark -D

echo "2) Start capture in a separate terminal"
echo 'tshark -i eth0 -f "udp port 53 or tcp port 443" -w captures/https-basic.pcapng'

echo "3) Generate controlled client traffic in another terminal"
echo 'curl --http1.1 --tlsv1.3 --no-keepalive --connect-timeout 10 --max-time 20 https://example.com/ -o /dev/null -v'

echo "4) Stop capture manually after the request finishes"

echo "5) Inspect capture summary"
capinfos captures/https-basic.pcapng || true

echo "6) Export and normalize after review"
npm run capture:export -- captures/https-basic.pcapng src/data/fixtures/https-basic.raw.json
npm run capture:normalize -- src/data/fixtures/https-basic.raw.json src/data/fixtures/https-basic.real.fixture.json
npm run capture:profile -- captures/https-basic.pcapng
npm run capture:map -- src/data/fixtures/https-basic.real.fixture.json

echo "7) Readiness checks"
npm run capture:readiness:strict -- src/data/fixtures/https-basic.real.fixture.json

