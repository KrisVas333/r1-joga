// node tools/build.mjs  → data/speech.json (for make_voice.py) + export/joga_l1..3.{yaml,csv} + export/poses/joga_l<n>_<id>.{yaml,csv} + safety summary
import { writeFileSync, mkdirSync } from "node:fs";
import { byLevel, speechTable, ASANAS } from "../js/asanas.js";
import { buildExport, buildPoseExport, safety } from "../js/timeline.js";
mkdirSync("data", { recursive: true }); mkdirSync("export/poses", { recursive: true });
writeFileSync("data/speech.json", JSON.stringify(speechTable(), null, 1));
for (const n of [1, 2, 3]) {
  const name = `joga_l${n}`, ex = buildExport(byLevel(n), "lt", name, `R1 Joga · ${n} lygis`);
  writeFileSync(`export/${name}.yaml`, ex.yaml); writeFileSync(`export/${name}.csv`, ex.csv);
  console.log(name, ex.rows, "rows", ex.seconds.toFixed(1), "s");
}
// one move per pose for robot mode (R1 Studio /joga/): export/poses/joga_l<level>_<id>.{yaml,csv}
let nPose = 0;
for (const n of [1, 2, 3]) for (const a of byLevel(n)) {
  if (a.locked) continue; // robot:false poses still export their arm part (legs stay sim-only)
  const ex = buildPoseExport(a);
  writeFileSync(`export/poses/${ex.name}.yaml`, ex.yaml); writeFileSync(`export/poses/${ex.name}.csv`, ex.csv); nPose++;
}
console.log("pose moves", nPose, "-> export/poses/");
let bad = 0;
for (const a of ASANAS) { const s = safety(a); if (s.flags.length) { bad++; console.log("FLAG", a.id, s.flags.map((f) => f.msg).join("; ")); } }
console.log("poses", ASANAS.length, "L1-3", ASANAS.filter((a) => a.level <= 3).length, "flagged", bad);
