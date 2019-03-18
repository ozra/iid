
## The Qid - "Quintessential Internet ID" ##

Yes, the name is contrived as hell. `Iid` was a bit confusing. All other cool initial letters were taken in npm ;-)

What's that? Simply uuid/v4, base62-encoded, zero-justified to 22 chars. It looks like "1eCH6Km2kWjIviA5l6q9VN" — made up of only latin letters and numbers. You probably know all about it already.

Looking around, the packages I found seemed shady. Or maybe it was NIH.

## The purpose of Qid ##

- Clean and simple for APIs, micro-service messaging, apps — you know; internet-stuff
- Generate a 128-bit Uuid/v4, encoded as a 22-char base-62 string: "Qid"
- Many mqtt broker implementations has max 22 chars for client_id. Perfect.
- Since it's considered practically and reasonably collision-free (unless using a sucky PRNG like WinAPI), it can be used to create unique ID's in a decentralized fashion. Good for internet-stuff and mobile.
- It's not as grotesquely in your face as "289b5d90-4f9b-4095-916b-d82451cf9f53" (uuid/v4 canonical hexadecimal string representation)
- Convert to and from Uuid/v4 canonical 36-char format for interfacing with databases, external APIs, etc
- Needless to say, loss-less conversion for all 128-bits, whereof 122 bits are entropy, as per specs.

## Sidenotes ##

- Written in TypeScript for safety's sake, type-defs included
- Uses arrays instead of buffers for browser-friendlyness
- Compiles to ES-mod and CommonJs-mod, to suit direct nodejs-usage, and pre-compiler chains for tree-shaking
- It leverages quite a bit of tidsbits from "base-x" (through a lineage of different authors), and depends on the ubiquituous "uuid" module

## Example ##

```javascript
const {Qid} = require("qid") // Or `import {Qid} from "qid"`
say = console.log

const qid = Qid()
say(qid)

const uuid = Qid.toUuid(qid)
say(uuid)

const qid2 = Qid.fromUuid(uuid)
say(qid2)

say(qid === qid2)
```

Example output:
```
1eCH6Km2kWjIviA5l6q9VN
289b5d90-4f9b-4095-916b-d82451cf9f53
1eCH6Km2kWjIviA5l6q9VN
true
```

That's all folks!
