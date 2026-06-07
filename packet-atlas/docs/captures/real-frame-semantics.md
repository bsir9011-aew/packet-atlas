# Packet Atlas v6.2 — Real Frame Semantics

v6.2 adds a second interpretation layer over the first verified real capture.

Before v6.2, stage hints answered:

> Which journey stage does this frame support?

v6.2 adds frame semantics:

> What is this individual frame actually doing?

This matters because many frames can support one stage. For example, a coarse `tcp-handshake` stage can include:

- TCP SYN,
- TCP SYN/ACK,
- TCP ACK / maintenance,
- TCP data carrier,
- TCP FIN/close.

The UI now shows both views:

- the stage journey view,
- the individual frame semantics view.
