import { bytes } from "../mod.ts"

import busStopsRaw from "http://cdn.jsdelivr.net/gh/gnlow/raw/file/1db7e5d0" with { type: "bytes" }

import * as z from "https://esm.sh/zod@4.1.13"

const res = bytes(busStopsRaw)
    .decode("euc-kr")
    .csv()
    .map(row => {
        if (row.위도 && row.경도) {
            if (Number(row.위도) > Number(row.경도)) {
                console.log("lonLatFix(swap)", row.정류장명)
                return {
                    ...row,
                    위도: row.경도,
                    경도: row.위도,
                }
            }
            if (row.위도 == row.경도) {
                console.log("lonLatFix(naaa)", row.정류장명)
                return {
                    ...row,
                    위도: undefined,
                    경도: undefined,
                }
            }
        }
        return row
    })
    .parseRow(z.object({
        정류장번호:     z.string(),
        정류장명:       z.string(),
        위도:          z.coerce.number().min(33).max(39).optional(),
        경도:          z.coerce.number().min(125).max(132).optional(),
        정보수집일:     z.coerce.date(),
        모바일단축번호:  z.string().optional(),
        도시코드:       z.string(),
        도시명:        z.string(),
        관리도시명:     z.string(),
    }))

console.log(res.raw.toArray().length)
