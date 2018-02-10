const {Iid} = require("../dist-cjs")
say = console.log

let count = 1000
say(`Random heat * ${count}`)

while (count-- != 0) {
    let iid = Iid()

    if (iid != Iid.fromUuid(Iid.toUuid(iid))) {
        say(iid, "=", Iid.fromUuid(Iid.toUuid(iid)), "(", Iid.toUuid(iid), ")")
        console.error("Fucked up!")
        process.exit(1)
    }
}

say("All seems good and dandy")
