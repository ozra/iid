const { Qid } = require("../")
say = console.log

let count = 1000
say(`Random heat * ${count}`)

const chron_duration = 10 * 365 * 24 * 60 * 60 * 1000

while (count-- != 0) {
    ;("Qid()")
    ;(() => {
        let qid = Qid()

        if (qid != Qid.fromUuid(Qid.toUuid(qid))) {
            say(
                qid,
                "=",
                Qid.fromUuid(Qid.toUuid(qid)),
                "(",
                Qid.toUuid(qid),
                ")"
            )
            console.error("Fucked up!")
            process.exit(1)
        }
    })()

    ;("base62.*")
    ;(() => {
        let n = Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
        let enc = Qid.base62.encode(n)
        say(n, enc, Qid.base62.decode(enc))
    })()

    ;("chron.point")
    ;(() => {
        let n = Date.now() + Math.round((Math.random() - 0.5) * chron_duration)
        let enc = Qid.base62.encode(n)
        say(n, enc, Qid.base62.decode(enc))

        let enc2 = Qid.base62.encode(n * 1000)
        say(n * 1000, enc2, Qid.base62.decode(enc2))
    })()
}

// ;("test_n")
// function test_n(n) {
//     say(
//         Qid.base56.encode(n),
//         Qid.base62.encode(n),
//         n,
//         Qid.base56.__byte_array_to_int53__(
//             Qid.base56.__int53_to_byte_array__(n)
//         ) - n
//     )
// }

test_n(0)
test_n(1)
test_n(47)
test_n(100)
test_n(2345)
test_n(234567)
test_n(1234567889)
test_n(Date.now())
test_n(Date.now() + chron_duration)
test_n(Date.now() * 1000)
test_n(Date.now() * 1000 + chron_duration * 1000)
test_n(23)

try {
    Qid(47, 18)
} catch (e) {
    say("expect error:", e)
}
try {
    Qid("stuff")
} catch (e) {
    say("expect error:", e)
}

say()

// const make_token = Qid.create_serial_token_source(23)
//
// for (let i = 0; i < 20; ++i) {
//     const out = []
//     for (let j = 0; j < 3; ++j) {
//         out.push(make_token())
//     }
//     say(out)
//
//     make_token.reseed()
// }

say()
say("All seems good and dandy")
