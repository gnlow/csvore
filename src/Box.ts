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

export class Text extends Box<string> {

}
