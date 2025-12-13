import { bytes } from "../mod.ts"

import busLinesRaw from "https://cdn.jsdelivr.net/gh/gnlow/raw/file/e4d3b5d2" with { type: "bytes" }

import * as z from "https://esm.sh/zod@4.1.13"

const res = bytes(busLinesRaw)
    .xlsx()
    .parseRow(z.object({
        "시/군/구": z.string().nonempty(),
        연도: z.coerce.number().int().min(2024).max(2024),
        월: z.coerce.number().int().min(1).max(12),
        노선: z.string().nonempty(),
        시종점: z.string().nonempty(),
        일시: z.literal(["평일", "주말"]),
        시간: z.string().transform(x => {
            const match = x.match(/^(\d+)시~(\d+)시$/)
            if (!match) return z.NEVER
            
            return parseInt(match[1], 10)
        }),
    }))

console.log(res.raw.toArray().length)
