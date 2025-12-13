export class Box<T> {
    raw
    constructor(raw: T) {
        this.raw = raw
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

import * as z from "https://esm.sh/zod@4.1.13"

export class Table<Row> extends Box<IteratorObject<Row>> {
    zodRow<T extends z.core.$ZodShape>(f: (z_: typeof z) => z.ZodObject<T>) {
        const schema = f(z)
        return this.map((row, i) => {
            const res = schema.safeParse(row)
            if (res.success) {
                return res.data
            } else {
                throw new Error(`fail on row ${i}:\n${res.error}`)
            }
        })
    }
    map<O>(f: (row: Row, i: number) => O) {
        return new Table(this.raw.map(f))
    }
}
