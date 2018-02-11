
## Iid - "Internet ID" ##

What's that? Simply uuid/v4, base62-encoded, zero-justified to 22 chars. It looks like "1eCH6Km2kWjIviA5l6q9VN" — made up of only latin letters and numbers. You probably know all about it already.

Looking around, the packages I found seemed shady. Or maybe it was NIH.

## The purpose of Iid ##

- Clean and simple for APIs, micro-service messaging, apps — you know; internet-stuff
- Generate a 128-bit Uuid/v4, encoded as a 22-char base-62 string: "Iid"
- Since it's considered practically and reasonably collision-free (unless using a sucky PRNG like WinAPI), it can be used to create unique ID's in a decentralized fashion. Good for internet-stuff and mobile.
- It's not as grotesquely in your face as "289b5d90-4f9b-4095-916b-d82451cf9f53" (uuid/v4 canonical hexa-decimal string representation)
- Convert to and from Uuid/v4 canonical 36-char format for interfacing with databases, external APIs, etc
- Needless to say, loss-less conversion for all 128-bits, whereof 122 bits are entropy, as per specs.

## Sidenotes ##

- Written in TypeScript for safety's sake, type-defs included
- Uses arrays instead of buffers for broser-friendlyness
- Compiles to ES-mod and CommonJs-mod, to suit direct nodejs-usage, and pre-compiler chains for tree-shaking
- It leverages quite a bit of tidsbits from "base-x" (through a lineage of different authors), and depends on the ubiquituous "uuid" module

## Example ##

```javascript
const {Iid} = require("iid") // Or `import {Iid} from "iid"`
say = console.log

const iid = Iid()
say(iid)

const uuid = Iid.toUuid(iid)
say(uuid)

const iid2 = Iid.fromUuid(uuid)
say(iid2)

say(iid === iid2)
```

Example output:
```
1eCH6Km2kWjIviA5l6q9VN
289b5d90-4f9b-4095-916b-d82451cf9f53
1eCH6Km2kWjIviA5l6q9VN
true
```

That's all folks!
