import { bytes } from "../mod.ts"

import busStopsRaw from "http://cdn.jsdelivr.net/gh/gnlow/raw/file/1db7e5d0" with { type: "bytes" }

const res = bytes(busStopsRaw)
    .decode("euc-kr")
    .csv()
    .zodRow(z => z.object({
        정류장번호:     z.string(),
        정류장명:       z.string(),
        위도:          z.coerce.number(),
        경도:          z.coerce.number(),
        정보수집일:     z.coerce.date(),
        모바일단축번호:  z.string().optional(),
        도시코드:       z.string(),
        도시명:        z.string(),
        관리도시명:     z.string(),
    }))

console.log(res)
