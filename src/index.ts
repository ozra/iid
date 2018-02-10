'use strict'
import { v4 as Uuid } from "uuid"

const base62 = createBase("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
const base16 = createBase("0123456789abcdef")

const Iid: any = function () {
    const uuidBytes = Uuid(null, [])
    return base62.encode(uuidBytes)
}

Iid.fromIid62OrUuid16 = function (someId: string) {
    // We do assume this is used in such a context that any string fitting the
    // length won't be something completely arbitrary
    if (someId.length === 22) {
        return someId
    } else if (someId.length === 36) {
        return Iid.fromUuid16(someId)
    } else {
        throw new Error(`Iid.fromIidOrUuid expects an Iid or a standard formatted Uuid base16, with the dashes, 36 characters long. The input "${someId}" isn't recognized.`)
    }
}

Iid.fromUuid16 = function (uuidBase16: string): string {
    // We do assume this is used in such a context that any string fitting the
    // length won't be something completely arbitrary
    if (uuidBase16.length != 36) throw new Error(`Iid.fromUuid expects a standard formatted Uuid base16, with the dashes, 36 characters long. The input "${uuidBase16}" isn't recognized.`)
    // Our hex-digits-lut and decoder only handles lowercase
    const washed = uuidBase16.replace("-", "").toLowerCase()
    return base62.encode(base16.decode(washed))
}

Iid.toUuid16 = function (iid: string): string {
    const uuid16 = base16.encode(base62.decode(iid))
    const part = (start: number, stop: number) => { return uuid16.substring(start, stop) }
    const specFormattedUuid16 =
        part(0, 8) + "-" +
        part(8, 12) + "-" +
        part(12, 16) + "-" +
        part(16, 20) + "-" +
        part(20, 32)
    return specFormattedUuid16
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

    function encode(source: Array<number>): string {
        if (source.length === 0) throw new Error("Empty input")

        const digits = [0]
        for (let i = 0; i < source.length; ++i) {
            let carry = source[i]
            for (let j = 0; j < digits.length; ++j) {
                carry += digits[j] << 8
                digits[j] = carry % base_
                carry = (carry / base_) | 0
            }

            while (carry > 0) {
                digits.push(carry % base_)
                carry = (carry / base_) | 0
            }
        }

        let output = ""

        // deal with leading zeros
        for (let i = 0; source[i] === 0 && i < source.length - 1; ++i) {
            output += padDigit_
        }
        // convert digits to a string
        for (let i = digits.length - 1; i >= 0; --i) {
            output += digits[digits[i]]
        }
        return output
    }

    function decode(input: string): Array<number> {
        if (typeof input !== 'string') throw new TypeError('Expected String')
        if (input.length === 0) throw new Error("Empty input")

        const bytes = [0]
        for (let i = 0; i < input.length; ++i) {
            const value = digitsLut_[input.charAt(i)]
            if (value === undefined) throw new Error(`Non-base${base_} digit`)
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
        for (let i = 0; input[i] === padDigit_ && i < input.length - 1; ++i) {
            bytes.push(0)
        }

        return bytes.reverse()
    }
    return {
        encode: encode,
        decode: decode,
    }
}

export default Iid
