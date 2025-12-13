import * as box from "./Box.ts"

const make =
<T, O>
(Class: { new(raw: T): O }) =>
(raw: T) =>
    new Class(raw)

export const {
    bytes,
    text,
} = Object.fromEntries(
    Object.entries(box).map(([k, v]) =>
        // @ts-expect-error: ignore
        [k.toLowerCase(), make(v)]
    )
) as unknown as {
    [K in keyof typeof box as Uncapitalize<K>]:
        typeof box[K] extends { new(raw: infer T): infer O }
            ? (raw: T) => O
            : never
}
