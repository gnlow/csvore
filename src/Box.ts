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
            })
        )
    }
}

import * as z from "https://esm.sh/zod@4.1.13"

export class Table<Row> extends Box<Iterable<Row>> {
    zodRow<T extends z.core.$ZodShape>(f: (z_: typeof z) => z.ZodObject<T>) {
        return new Table(z.array(f(z)).parse(this.raw))
    }
}
