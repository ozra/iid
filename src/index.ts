"use strict"
import * as v4 from "uuid/v4"
const Uuid = v4 // these steps are to satisfy Ts AND Rollup

const base62 = create_base(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
)
const base16 = create_base("0123456789abcdef")

/**
 * For id's that will be parsed by a human, where you want to minimize the risk
 * of misinterpretation: the common culprits `Il1` & `oO0` are simply removed
 * from the set
 */
const base56 = create_base(
    "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
)

// TODO: add this, and casts where needed then
// export interface Qid extends String {
//     _QidBrand: string
// }

/// Generate a new uuid/v4, encoded in base62, zero-padded to always be 22 chars
export const Qid = Object.assign(generate_quuid, {
    from: from,

    // // // // // // // // //
    // Snakes are easier to deal with
    // // // // // // // // //

    from_or_make: from_or_make,
    from_uuid: from_uuid,
    to_uuid: to_uuid,

    // // // // // // // // //
    // Camels are popular
    // // // // // // // // //

    fromOrMake: from_or_make,
    fromUuid: from_uuid,
    toUuid: to_uuid,

    // // // // // // // // //
    // Export deps that are already instantiated anyway, for convenience
    // // // // // // // // //

    base16: base16,
    base62: base62,
    base56: base56,

    create_base: create_base,
    createBase: create_base,

    // create_prnd_token_source: create_prnd_token_source,
    create_serial_token_source: create_serial_token_source,

    Uuid: Uuid
})

function generate_quuid(): string {
    if (arguments.length) {
        throw new TypeError(
            `Qid.generate_quuid -> expects no arguments. Got (${Array.prototype.slice
                .call(arguments, 0)
                .map(JSON.stringify)}).`
        )
    }
    const uuid_bytes = Uuid(null, [])
    const uuid62 = base62.encode(uuid_bytes, false)
    return justify_right(uuid62, 22)
}

/// Convenience function for when the input can be either kind
// TODO: should handle Qid, Buffer and Array<Byte> also
function from(some_id: string) {
    // We do assume this is used in such a context that any string fitting the
    // length won't be something completely arbitrary
    if (typeof some_id === "string") {
        if (some_id.length === 22) {
            return some_id
        } else if (some_id.length === 36) {
            return from_uuid(some_id)
        }
    }
    throw new TypeError(
        `Qid.from -> expects a Qid or a standard formatted Uuid base16, with the dashes, 36 characters long. The input "${some_id}" isn't recognized.`
    )
}

/// Convenience function for when input can be either format or undefined/null,
/// in which case it will create a new Qid
function from_or_make(maybeSomeId: string | null | undefined) {
    if (maybeSomeId) {
        return Qid.from(maybeSomeId)
    } else {
        return Qid()
    }
}

/// Convert a uuid/v4 in common base-16 format, with the dashes and all to a Qid
function from_uuid(uuid_in_base_16: string): string {
    // We do assume this is used in such a context that any string fitting the
    // length won't be something completely arbitrary
    if (uuid_in_base_16.length != 36)
        throw new TypeError(
            `Qid.from_uuid ->  expects a standard formatted Uuid base16, with the dashes, 36 characters long. The input "${uuid_in_base_16}" isn't recognized.`
        )
    // Our hex-digits-lut and decoder only handles lowercase
    const washed = uuid_in_base_16.replace(/-/g, "").toLowerCase()
    const uuid62 = base62.encode(base16.decode(washed), false)
    return justify_right(uuid62, 22)
}

/// Convert a Qid to a uuid/v4 in common base-16 format, with the dashes and all
function to_uuid(iid: string): string {
    const uuid16Raw = base16.encode(base62.decode(iid), false)
    const uuid16 = justify_right(uuid16Raw, 32)
    const part = (start: number, stop: number) => {
        return uuid16.substring(start, stop)
    }
    const specFormattedUuid16 =
        part(0, 8) +
        "-" +
        part(8, 12) +
        "-" +
        part(12, 16) +
        "-" +
        part(16, 20) +
        "-" +
        part(20, 32)
    return specFormattedUuid16
}

// // // // // // // // // // // // // // // // // // // // // // // // // // //
function justify_right(text: string, width: number, pad_char = "0") {
    const delta = width - text.length
    // console.log("delta", delta, text.length, width, text)
    if (delta == -1) {
        return text.slice(1)
    } else {
        return pad_char.repeat(delta) + text
    }
}

// For some reason typescript module resolvment fucks up unless we export more
// than one item(!?)
export function create_base(digits_for_base_: string) {
    const digits_LUT_ = {}
    const padding_digit_ = digits_for_base_.charAt(0)
    const base_number_ = digits_for_base_.length

    // added convenience for wider use of encode: regular numbers
    const reused_byte_buffer_ = [0, 0, 0, 0, 0, 0, 0, 0] // new Array(8)

    prepare_digit_lookup_table_()

    return {
        encode: encode,
        decode: decode,
        // These are for simplifying testing - protect the reused buffer!
        __byte_array_to_int53__: __byte_array_to_int53__,
        __int53_to_byte_array__: function(n) {
            return __int53_to_byte_array__(n).slice(0)
        }
    }

    function prepare_digit_lookup_table_() {
        for (let i = 0; i < base_number_; i++) {
            const digit = digits_for_base_.charAt(i)
            if (digits_LUT_[digit] !== undefined)
                throw new Error(`create_base -> duplicate digit: "${digit}"`)
            digits_LUT_[digit] = i
        }
    }

    // TODO: is `&` actually working with > 32b numbers? Otherwise use a slower
    // solution, separating into two 32bit heaps
    function __int53_to_byte_array__(value: number) {
        for (let i = 7; i >= 0; --i) {
            const byte = value & 0xff
            reused_byte_buffer_[i] = byte
            value = (value - byte) / 256 // shr truncates to 32 bits, so...
        }
        return reused_byte_buffer_
    }

    function __byte_array_to_int53__(byte_array: Array<number>): number {
        let value = 0
        const len = byte_array.length
        for (let i = 0; i < len; ++i) {
            value = value * 256 + byte_array[i]
        }
        return value
    }

    function encode(
        value: Array<number> | number,
        trim_initial_zeroes: boolean = true
    ): string {
        const byte_array = (typeof value === "number"
            ? __int53_to_byte_array__(value)
            : value) as Readonly<Array<number>>

        if (byte_array.length === 0) throw new Error("Empty input")

        const dest = [0]

        for (let i = 0; i < byte_array.length; ++i) {
            let carry = byte_array[i]
            for (let j = 0; j < dest.length; ++j) {
                carry += dest[j] << 8
                dest[j] = carry % base_number_
                carry = (carry / base_number_) | 0
            }

            while (carry > 0) {
                dest.push(carry % base_number_)
                carry = (carry / base_number_) | 0
            }
        }

        // Uses array for concat to ensure a "flattened string", b/c of V8-bug:
        // https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

        let output = [] as Array<string>

        if (trim_initial_zeroes) {
            let i = dest.length - 1
            for (; i > 1 && dest[i] === 0; --i) {
                // Just increase index
            }
            for (; i >= 0; --i) {
                output.push(digits_for_base_[dest[i]])
            }
        } else {
            // maintain leading zeros for the provided bit-width
            for (
                let i = 0;
                byte_array[i] === 0 && i < byte_array.length - 1;
                ++i
            ) {
                output.push(padding_digit_)
            }

            // convert digits to a string
            for (let i = dest.length - 1; i >= 0; --i) {
                output.push(digits_for_base_[dest[i]])
            }
        }

        return output.join("")
    }

    function decode(input_string: string): Array<number> {
        if (typeof input_string !== "string")
            throw new TypeError("create_base -> decode -> expected string")

        if (input_string.length === 0)
            throw new TypeError("create_base -> decode -> empty input string")

        const bytes = [0]

        for (let i = 0; i < input_string.length; ++i) {
            const value = digits_LUT_[input_string.charAt(i)]
            if (value === undefined)
                throw new TypeError(
                    `create_base -> decode -> non-base${base_number_} digit: "${input_string.charAt(
                        i
                    )}"`
                )
            let carry = value

            for (let j = 0; j < bytes.length; ++j) {
                carry += bytes[j] * base_number_
                bytes[j] = carry & 0xff
                carry >>= 8
            }

            while (carry > 0) {
                bytes.push(carry & 0xff)
                carry >>= 8
            }
        }

        // deal with leading zeros
        for (
            let i = 0;
            input_string[i] === padding_digit_ && i < input_string.length - 1;
            ++i
        ) {
            bytes.push(0)
        }

        return bytes.reverse()
    }
}

// // TODO waste this crap!
// function create_prnd_token_source(seed_entropy_bit_width: number = 24) {
//     return function() {
//         // const prnd_value = Math.round(
//         //     // TODO use above better rngs!
//         //     Math.random() * Math.pow(2, seed_entropy_bit_width)
//         // )
//         const prng_value = crypto.randomBytes(
//             Math.round(seed_entropy_bit_width / 8)
//         )

//         return base62.encode(prnd_value)
//     }
// }

function create_serial_token_source(seed_entropy_bit_width: number = 24) {
    let base = ""
    let serial = 0

    function reseed() {
        const base_value = Math.round(
            // TODO use above better rngs!
            Math.random() * Math.pow(2, seed_entropy_bit_width)
        )
        base = base62.encode(base_value)
        const final_chars_justification = 4 // TODO
        while (base.length < final_chars_justification) {
            base = `x${base}`
        }
        serial = 0
    }

    reseed()

    return Object.assign(
        function() {
            serial++
            return base + "-" + base62.encode(serial)
        },
        {
            reseed: reseed
        }
    )
}
