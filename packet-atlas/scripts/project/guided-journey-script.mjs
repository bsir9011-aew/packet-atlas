import fs from 'node:fs'

const output = 'reports/guided-journey-script.md'

const steps = [
  ['URL intent', 'A human intention becomes a browser task, but it is not a network packet yet.'],
  ['Browser checks', 'The browser checks what it already knows before it asks the network for help.'],
  ['DNS query', 'The journey becomes a DNS question: where should this request go?'],
  ['DNS response', 'The DNS answer gives the browser a usable destination.'],
  ['TCP handshake', 'The machines build a transport session before TLS or HTTP can matter.'],
  ['TLS handshake', 'TLS creates the sealed envelope around the later HTTP conversation.'],
  ['HTTP request', 'Inside the protected path, the browser asks for the resource.'],
  ['Server work', 'The server-side application produces the answer.'],
  ['HTTP response', 'The answer starts traveling back through the established path.'],
  ['Browser render', 'The browser turns returned data into visible content.'],
]

const lines = [
  '# Packet Atlas Guided Journey Script',
  '',
  'One journey, many lenses.',
  '',
  'Read one step. Say it simply. Ask what evidence proves it. Then move next.',
  '',
  ...steps.flatMap(([name, line], index) => [
    `## Step ${index + 1}: ${name}`,
    '',
    `**Story:** ${line}`,
    '',
    '**Proof question:** What evidence would prove this step exists?',
    '',
    '**Notebook:** Write this step in one short sentence.',
    '',
  ]),
  '## Final recap',
  '',
  'One web request is one story: human intent -> DNS -> TCP -> TLS -> HTTP -> server work -> response -> browser render.',
  '',
]

fs.writeFileSync(output, lines.join('\n'))
console.log(`📖 Guided journey script written: ${output}`)
