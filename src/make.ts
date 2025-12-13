import * as box from "./Box.ts"

const make =
<T, O>
(Class: { new(raw: T): O }) =>
(raw: T) =>
    new Class(raw)

export const {
    Bytes,
    Text,
} = Object.fromEntries(
    Object.entries(box).map(([k, v]) =>
        // @ts-expect-error: ignore
        [k, make(v)]
    )
) as unknown as {
    [K in keyof typeof box]:
        typeof box[K] extends { new(raw: infer T): infer O }
            ? (raw: T) => O
            : never
}
