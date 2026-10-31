// node tools/build.mjs  → data/speech.json (for make_voice.py) + export/joga_l1..3.{yaml,csv} + safety summary
import { writeFileSync, mkdirSync } from "node:fs";
import { byLevel, speechTable, ASANAS } from "../js/asanas.js";
import { buildExport, safety } from "../js/timeline.js";
mkdirSync("data", { recursive: true }); mkdirSync("export", { recursive: true });
writeFileSync("data/speech.json", JSON.stringify(speechTable(), null, 1));
for (const n of [1, 2, 3]) {
  const name = `joga_l${n}`, ex = buildExport(byLevel(n), "lt", name, `R1 Joga · ${n} lygis`);
  writeFileSync(`export/${name}.yaml`, ex.yaml); writeFileSync(`export/${name}.csv`, ex.csv);
  console.log(name, ex.rows, "rows", ex.seconds.toFixed(1), "s");
}
let bad = 0;
for (const a of ASANAS) { const s = safety(a); if (s.flags.length) { bad++; console.log("FLAG", a.id, s.flags.map((f) => f.msg).join("; ")); } }
console.log("poses", ASANAS.length, "L1-3", ASANAS.filter((a) => a.level <= 3).length, "flagged", bad);
