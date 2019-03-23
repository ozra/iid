"use strict"
import * as v4 from "uuid/v4"
export const Uuid = v4 // these steps are to satisfy Ts AND Rollup
// const rng = require("uuid/lib/rng")

export const base62 = create_base(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
)

export const base16 = create_base("0123456789abcdef")

/** For human-parseable ID's: digits set without `[Il1oO0]` */
export const base56 = create_base(
    "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
)

export const Qid = Object.assign(generate_qid, {
    from: from,

    // // // // // // // // //
    // Snakes are easier to spot
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

    UuidV4: Uuid,
    Uuid: Uuid
})

/// Generate a new uuid/v4, encoded in base62, zero-padded to always be 22 chars
function generate_qid(): string {
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
function to_uuid(qid_b62: string): string {
    const uuid16_raw = base16.encode(base62.decode(qid_b62), false)
    const uuid16 = justify_right(uuid16_raw, 32)
    const part = (start: number, stop: number) => {
        return uuid16.substring(start, stop)
    }
    const spec_formatted_uuid_v4_b16 =
        part(0, 8) +
        "-" +
        part(8, 12) +
        "-" +
        part(12, 16) +
        "-" +
        part(16, 20) +
        "-" +
        part(20, 32)

    return spec_formatted_uuid_v4_b16
}

// // // // // // // // // // // // // // // // // // // // // // // // // // //
function justify_right(text: string, width: number, zero_digit = "0") {
    const delta = width - text.length

    // I've seen multiple zeros generating a -2 surplus — only happens once
    // in a blue moon. Now it's deterministic.
    if (delta < 0) {
        return text.slice(-delta)
    } else {
        return zero_digit.repeat(delta) + text
    }
}

// For some reason typescript module resolvment fucks up unless we export more
// than one item(!?)
export function create_base(digits_for_base_: string) {
    const digits_LUT_ = {}
    const zero_digit_ = digits_for_base_.charAt(0)
    const base_number_ = digits_for_base_.length

    // TODO: refactor Number<=>ArrayBuffer out from create_base
    // Added convenience for wider use of encode: regular numbers - just to create
    // shorter wire-codes
    // NOTE: it's only 8 cells wide, because it only handles "53-bit integers"
    // since the ints will be represented by a 64 bit double in Javascript
    const reused_byte_buffer_ = [0, 0, 0, 0, 0, 0, 0, 0]

    prepare_digit_lookup_table_()

    return {
        encode: encode,
        decode: decode
    }

    function prepare_digit_lookup_table_() {
        for (let i = 0; i < base_number_; i++) {
            const digit = digits_for_base_.charAt(i)
            if (digits_LUT_[digit] !== undefined)
                throw new Error(`create_base -> duplicate digit: "${digit}"`)
            digits_LUT_[digit] = i
        }
    }

    function __int53_to_byte_array__(value: number) {
        for (let i = 7; i >= 0; --i) {
            const byte = value & 0xff
            reused_byte_buffer_[i] = byte
            value = (value - byte) / 256
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
            // FIXME: this is a noop-bug - it's in reverse!
            for (
                let i = 0;
                byte_array[i] === 0 && i < byte_array.length - 1;
                ++i
            ) {
                output.push(zero_digit_)
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
            input_string[i] === zero_digit_ && i < input_string.length - 1;
            ++i
        ) {
            bytes.push(0)
        }

        return bytes.reverse()
    }
}
