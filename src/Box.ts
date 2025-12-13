export class Box<T> {
    raw
    constructor(raw: T) {
        this.raw = raw
    }

    pipe<O>(f: (raw: T) => O) {
        return new Box(f(this.raw))
    }
    pass(f: (raw: T) => void) {
        f(this.raw)
        return this
    }
}

export class Bytes extends Box<Uint8Array<ArrayBuffer>> {
    decode(label: string) {
        return new Text(
            new TextDecoder(label).decode(this.raw)
        )
    }
}

import { parse } from "https://esm.sh/jsr/@std/csv@1.0.6"

export class Text extends Box<string> {
    csv() {
        return new Table(
            parse(this.raw, {
                skipFirstRow: true,
            }).values().map(x =>
                Object.fromEntries(
                    Object.entries(x).map(([k, v]) =>
                        [k, v == "" ? undefined : v]
                    )
                )
            )
        )
    }
}

import type { StandardSchemaV1 as S } from "https://esm.sh/@standard-schema/spec@1.0.0"

export class Table<Row> extends Box<IteratorObject<Row>> {
    parseRow<T extends S>(schema: T) {
        return this.map((row, i) => {
            const res = schema["~standard"].validate(row)
            if (res instanceof Promise) {
                throw new Error("Async validator is not implemented")
            }
            if (res.issues) {
                throw new Error(`fail on row ${i}:\n${res.issues}`)
            }
            return res.value as S.InferOutput<T>
        })
    }
    map<O>(f: (row: Row, i: number) => O) {
        return new Table(this.raw.map(f))
    }
}
