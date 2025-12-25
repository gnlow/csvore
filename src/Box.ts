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

export class StreamBox<T> extends Box<AsyncIterable<T>> {
    toStream() {
        return ReadableStream.from(this.raw)
    }
    toArray() {
        return Array.fromAsync(this.raw)
    }

    map<O>(f: (chunk: T, i: number) => O | Promise<O>) {
        const raw = this.raw
        return new StreamBox((async function* () {
            let i = 0
            for await (const chunk of raw) {
                yield await f(chunk, i++)
            }
        })())
    }
    take(n: number) {
        const raw = this.raw
        return new StreamBox((async function* () {
            if (n <= 0) return
            let i = 0
            for await (const chunk of raw) {
                yield chunk
                if (++i >= n) break
            }
        })())
    }

    async forEach(f: (chunk: T) => void | Promise<void>) {
        for await (const chunk of this.raw) {
            await f(chunk)
        }
    }
}

// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.3/package/types/index.d.ts"
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs"

export class Bytes extends Box<Uint8Array<ArrayBuffer>> {
    decode(label: string) {
        return new Text(
            new TextDecoder(label).decode(this.raw)
        )
    }
    xlsx() {
        const workbook = XLSX.read(this.raw, {
            dense: true,
        })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        return new Table(XLSX.utils.sheet_to_json(sheet).values())
    }
    chunk(chunkSize = 1024 * 64) {
        const raw = this.raw
        let offset = 0
        
        return new BytesStream(
            new ReadableStream<Uint8Array<ArrayBuffer>>({
                pull(ctl) {
                    if (offset >= raw.byteLength) {
                        ctl.close()
                        return
                    }

                    const chunk = raw.slice(offset, offset += chunkSize)
                    ctl.enqueue(chunk)
                }
            })
        )
    }
}

export class BytesStream extends StreamBox<Uint8Array<ArrayBuffer>> {
    decode(label: string) {
        return new TextStream(
            this.toStream().pipeThrough(new TextDecoderStream(label)
        ))
    }
}

import { parse, CsvParseStream } from "https://esm.sh/jsr/@std/csv@1.0.6"

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

export class TextStream extends StreamBox<string> {
    csv() {
        return new TableStream(
            this.toStream().pipeThrough(new CsvParseStream({
                skipFirstRow: true,
            }))
        )
    }
}

import type { StandardSchemaV1 as S } from "https://esm.sh/@standard-schema/spec@1.0.0"

const parseRow =
<T extends S>(schema: T) =>
<Row>(row: Row, i: number) => {
    const res = schema["~standard"].validate(row)
    if (res instanceof Promise) {
        throw new Error("Async validator is not implemented")
    }
    if (res.issues) {
        throw new Error(`fail on row ${i}:\n${res.issues}`)
    }
    return res.value as S.InferOutput<T>
}

export class Table<Row> extends Box<IteratorObject<Row>> {
    parseRow<T extends S>(schema: T) {
        return this.map(parseRow(schema))
    }
    map<O>(f: (row: Row, i: number) => O) {
        return new Table(this.raw.map(f))
    }
}

export class TableStream<Row> extends StreamBox<Row> {
    parseRow<T extends S>(schema: T) {
        return this.map(parseRow(schema))
    }
}
