'use strict'
import { v4 as Uuid } from "uuid"

const base62 = createBase("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
const base16 = createBase("0123456789abcdef")

/// Generate a new uuid/v4, encoded in base62, zero-padded to always be 22 chars
export const Iid: any = function () {
    const uuidBytes = Uuid(null, [])
    const uuid62 = base62.encode(uuidBytes)
    return justifyRight(uuid62, 22)
}

/// Convenience function for when the input can be either kind
// *TODO* should handle array of bytes too
Iid.from = function (someId: string) {
    // We do assume this is used in such a context that any string fitting the
    // length won't be something completely arbitrary
    if (someId.length === 22) {
        return someId
    } else if (someId.length === 36) {
        return Iid.fromUuid(someId)
    } else {
        throw new Error(`Iid.fromIidOrUuid expects an Iid or a standard formatted Uuid base16, with the dashes, 36 characters long. The input "${someId}" isn't recognized.`)
    }
}

/// Convenience function for when input can be either format or undefined/null,
/// in which case it will create a new Iid
Iid.fromOrMake = function (maybeSomeId: string | null | undefined) {
    if (maybeSomeId) {
        return Iid.from(maybeSomeId)
    } else {
        return Iid()
    }
}

/// Convert a uuid/v4 in common base-16 format, with the dashes and all to an Iid
Iid.fromUuid = function (uuidBase16: string): string {
    // We do assume this is used in such a context that any string fitting the
    // length won't be something completely arbitrary
    if (uuidBase16.length != 36) throw new Error(`Iid.fromUuid expects a standard formatted Uuid base16, with the dashes, 36 characters long. The input "${uuidBase16}" isn't recognized.`)
    // Our hex-digits-lut and decoder only handles lowercase
    const washed = uuidBase16.replace(/-/g, "").toLowerCase()
    const uuid62 = base62.encode(base16.decode(washed))
    return justifyRight(uuid62, 22)
}

/// Convert an Iid to a uuid/v4 in common base-16 format, with the dashes and all
Iid.toUuid = function (iid: string): string {
    const uuid16Raw = base16.encode(base62.decode(iid))
    const uuid16 = justifyRight(uuid16Raw, 32)
    const part = (start: number, stop: number) => { return uuid16.substring(start, stop) }
    const specFormattedUuid16 =
        part(0, 8) + "-" +
        part(8, 12) + "-" +
        part(12, 16) + "-" +
        part(16, 20) + "-" +
        part(20, 32)
    return specFormattedUuid16
}

Iid.base16 = base16

Iid.base62 = base62

Iid.createBase = createBase

Iid.Uuid = Uuid

function justifyRight(text: string, width: number, padChar = "0") {
    const delta = width - text.length
    // console.log("delta", delta, text.length, width, text)
    if (delta == -1) {
        return text.slice(1)
    } else {
        return padChar.repeat(delta) + text
    }
}

function createBase(baseDigits_: string) {
    const digitsLut_ = {}
    const base_ = baseDigits_.length
    const padDigit_ = baseDigits_.charAt(0)

    // pre-compute lookup table
    for (let i = 0; i < base_; i++) {
        const digit = baseDigits_.charAt(i)
        if (digitsLut_[digit] !== undefined) throw new Error(`Duplicate digit: "${digit}"`)
        digitsLut_[digit] = i
    }

    function encode(byteArray: Array<number>): string {
        if (byteArray.length === 0) throw new Error("Empty input")

        const dest = [0]
        for (let i = 0; i < byteArray.length; ++i) {
            let carry = byteArray[i]
            for (let j = 0; j < dest.length; ++j) {
                carry += dest[j] << 8
                dest[j] = carry % base_
                carry = (carry / base_) | 0
            }

            while (carry > 0) {
                dest.push(carry % base_)
                carry = (carry / base_) | 0
            }
        }

        let output = ""
        // deal with leading zeros
        for (let i = 0; byteArray[i] === 0 && i < byteArray.length - 1; ++i) {
            output += padDigit_
        }
        // convert digits to a string
        for (let i = dest.length - 1; i >= 0; --i) {
            output += baseDigits_[dest[i]]
        }
        return output
    }

    function decode(inputString: string): Array<number> {
        if (typeof inputString !== 'string') throw new TypeError('Expected String')
        if (inputString.length === 0) throw new Error("Empty input")

        const bytes = [0]
        for (let i = 0; i < inputString.length; ++i) {
            const value = digitsLut_[inputString.charAt(i)]
            if (value === undefined) throw new Error(`Non-base${base_} digit: "${inputString.charAt(i)}"`)
            let carry = value

            for (let j = 0; j < bytes.length; ++j) {
                carry += bytes[j] * base_
                bytes[j] = carry & 0xff
                carry >>= 8
            }

            while (carry > 0) {
                bytes.push(carry & 0xff)
                carry >>= 8
            }
        }

        // deal with leading zeros
        for (let i = 0; inputString[i] === padDigit_ && i < inputString.length - 1; ++i) {
            bytes.push(0)
        }

        return bytes.reverse()
    }
    return {
        encode: encode,
        decode: decode,
    }
}
