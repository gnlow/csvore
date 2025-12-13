import { bytes } from "../mod.ts"

import busStopsRaw from "http://cdn.jsdelivr.net/gh/gnlow/raw/file/1db7e5d0" with { type: "bytes" }

console.log(
    bytes(busStopsRaw)
    .decode("euc-kr")
    .csv()
)
