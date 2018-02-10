# Iid - Internet ID #

What's that? Simply uuid/v4, base62-encoded, zero-justified to 22 chars. It looks like "1eCH6Km2kWjIviA5l6q9VN" and contains only latin letters and numbers. You probably know all about it already.

Looking around, the packages I found seemed shady. Or maybe it was NIH.

## The purpose of Iid ##

- Clean and simple for APIs, micro-service messaging, apps — you know; internet-stuff
- Generate a 128-bit Uuid/v4, encoded as a 22-char base-62 string: "Iid"
- Convert from and to Uuid/v4 standard 36-char format in hex for database-interfacing, external APIs, etc
- Needless to say, loss less conversion with full 128-bit entropy

## Sidenotes ##

- Written in TypeScript for safety's sake, type-defs included
- Uses arrays instead of buffers for broser-friendlyness
- Compiles to ES-mod and CommonJs-mod, to suit direct nodejs-usage, and pre-compiler chains for tree-shaking

## Example ##

```javascript
const {Iid} = require("iid") // Or `import {Iid} from "iid"` if using esmod
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
