// R1 Jogos Instruktorius: class runner, voice, controller mock, safety check, export.
import { Robot3D } from "./robot.js";
import { ASANAS, LEVELS, byLevel, REST_POSE, PHRASES, introText, explainText } from "./asanas.js";
import { moveDur, safety, buildExport, full, BLOCK, poseMoveName } from "./timeline.js";
import { CAP } from "./joints.js";
import { track } from "./track.js";

const $ = (s) => document.querySelector(s);
const UI = {
  lt: {
    start: "Pradėti", pause: "Pauzė", cont: "Tęsti", next: "Kitas", back: "Atgal", explain: "Paaiškink pozą", stop: "STOP",
    level: "Lygis", hold: "Laikyk", breaths: "kvėpavimai", benefit: "Nauda", caution: "Atsargiai", cues: "Ką daryti",
    robotYes: "🤖 Robotas rodo", robotNo: "🖥️ Tik ekrane", sim: "simuliacija", locked: "🔒 Užrakinta robotui: apsivertimai / grindys = robotui nesaugu. Rodoma tik ekrane.",
    robotNote: "Tikram robotui: rankos, liemuo, galva ir plaštakos. Kojas valdo Unitree pusiausvyros valdiklis.",
    idle: "Pasirink lygį ir spausk Pradėti", paused: "Pauzė", stopped: "Sustabdyta. Saugi padėtis.", done: "Pamoka baigta",
    yes: "Taip", no: "Ne", mic: "🎤 Klausyk", micOn: "🎤 Klausau…", micNo: "Balso atpažinimas šioje naršyklėje neveikia (bandyk Chrome).",
    tabs: ["Valdiklis", "Komandos", "Asanos", "Saugumo patikra", "Eksportas"],
    ltVoiceMissing: "LT balsas: šioje naršyklėje lietuviško balso nėra, kalbu angliškai. Kriso ElevenLabs įrašai bus pridėti.",
    tempo: "Tempas", pose: "Poza", of: "iš", exportBtn: "Atsisiųsti YAML + CSV", exportLocked: "4–6 lygiai neeksportuojami: robotui užrakinta.",
    safetyHead: ["Poza", "Ženklas", "Maks. greitis", "Maks. ribos dalis", "Vėliavos"], ok: "✅ gerai",
    soundOn: "🔊 Garsas įjungtas", vFront: "priekis", vSide: "šonas", exportHelp: "r1ctl dance YAML + rankų CSV (t + 13 sąnarių, 50 Hz, radianai). Tik viršutinė kūno dalis. Kojos lieka Unitree pusiausvyros valdikliui.", tapToStart: "Paspausk Pradėti: robotas kalbės ir ves pamoką.",
    rNote: "🤖 Robotas: paleisk iš R1 Studio serverio", rOff: "🤖 Robotas: išjungtas", rOn: "🤖 Robotas: ĮJUNGTAS", rLive: "LIVE", rDry: "DRY-RUN (serveris be --live)",
    rStudio: "R1 Studio rastas. Spausk 🤖 Robotas, kad pozos keliautų į robotą.", goTitle: "⚠️ Tikras robotas", goAsk: "Įrašyk GO:",
    goList: ["Pirmi kartai: robotas ant kėlimo rėmo (gantry)", "Pultelis rankoje (avarinis stabdymas)", "2 m laisvos vietos, vaikai už linijos", "Jokių pirštų roboto plaštakose", "Esc arba ■ STOP = stabdyti iškart"],
  },
  en: {
    start: "Start", pause: "Pause", cont: "Continue", next: "Next", back: "Back", explain: "Explain pose", stop: "STOP",
    level: "Level", hold: "Hold", breaths: "breaths", benefit: "Benefit", caution: "Caution", cues: "What to do",
    robotYes: "🤖 Robot shows it", robotNo: "🖥️ Screen only", sim: "simulation", locked: "🔒 Locked for the robot: inversions / floor work are not safe for the robot. Shown on screen only.",
    robotNote: "Real robot: arms, waist, head and hands. Legs stay with Unitree's balance controller.",
    idle: "Pick a level and press Start", paused: "Paused", stopped: "Stopped. Safe position.", done: "Class done",
    yes: "Yes", no: "No", mic: "🎤 Listen", micOn: "🎤 Listening…", micNo: "Speech recognition does not work in this browser (try Chrome).",
    tabs: ["Controller", "Commands", "Asanas", "Safety check", "Export"],
    ltVoiceMissing: "",
    tempo: "Tempo", pose: "Pose", of: "of", exportBtn: "Download YAML + CSV", exportLocked: "Levels 4–6 are not exported: locked for the robot.",
    safetyHead: ["Pose", "Badge", "Max speed", "Max range used", "Flags"], ok: "✅ ok",
    soundOn: "🔊 Sound on", vFront: "front", vSide: "side", exportHelp: "r1ctl dance YAML + arm CSV (t + 13 joints, 50 Hz, radians). Upper body only. Legs stay with Unitree's balance controller.", tapToStart: "Press Start: the robot will speak and lead the class.",
    rNote: "🤖 Robot: run this page from the R1 Studio server", rOff: "🤖 Robot: off", rOn: "🤖 Robot: ON", rLive: "LIVE", rDry: "DRY-RUN (server without --live)",
    rStudio: "R1 Studio found. Press 🤖 Robot to send each pose to the robot.", goTitle: "⚠️ Real robot", goAsk: "Type GO:",
    goList: ["First runs: robot on the gantry", "Remote in hand (emergency stop)", "2 m clear, kids behind the line", "No fingers in the robot's hands", "Esc or ■ STOP = stop at once"],
  },
};
const COMMANDS = [
  { act: "start", lt: ["pradėk", "pradėti", "pradedam", "pradėkim"], en: ["start", "begin"] },
  { act: "pause", lt: ["pauzė", "pauze", "palauk", "sustok trumpam"], en: ["pause", "wait"] },
  { act: "cont", lt: ["tęsk", "tęsti", "tęsiam", "toliau"], en: ["continue", "resume", "go on"] },
  { act: "stop", lt: ["stop", "stok", "sustok", "sustabdyk"], en: ["stop", "halt"] },
  { act: "next", lt: ["kitas", "kita", "sekantis"], en: ["next", "skip"] },
  { act: "back", lt: ["atgal", "ankstesnis"], en: ["back", "previous"] },
  { act: "explain", lt: ["paaiškink", "paaiškinti", "kaip"], en: ["explain", "how"] },
  { act: "slower", lt: ["lėčiau", "leciau"], en: ["slower", "slow down"] },
  { act: "faster", lt: ["greičiau", "greiciau"], en: ["faster", "speed up"] },
  { act: "cmds", lt: ["komandų sąrašas", "komandos"], en: ["command list", "commands"] },
  { act: "poses", lt: ["asanų sąrašas", "asanos", "pozos"], en: ["pose list", "asanas", "poses"] },
  { act: "lang_en", lt: ["kalba anglų", "angliškai", "anglų"], en: ["language english", "english"] },
  { act: "lang_lt", lt: ["kalba lietuvių", "lietuviškai", "lietuvių"], en: ["language lithuanian", "lithuanian"] },
  { act: "yes", lt: ["taip", "gerai", "aišku"], en: ["yes", "yeah", "okay"] },
  { act: "no", lt: ["ne", "neaišku"], en: ["no", "not clear"] },
];

const S = {
  lang: "lt", level: 1, flow: byLevel(1), idx: 0, phase: "idle", tempo: 1, paused: false, stopped: false,
  ctrl: null, runId: 0, checkin: null, manifest: { lt: [], en: [] }, audio: null, rec: null, listening: false,
};
const robot = new Robot3D($("#view"));
window.__r1joga = { S, robot }; // for QA in the console

// ---------- speech output ----------
let voices = [];
const loadVoices = () => { voices = speechSynthesis.getVoices(); updateVoiceNote(); };
if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
const ltVoice = () => voices.find((v) => /^lt/i.test(v.lang));
const enVoice = () => voices.find((v) => /^en-US/i.test(v.lang) && /Google|Natural|Online/i.test(v.name)) || voices.find((v) => /^en/i.test(v.lang));
function updateVoiceNote() {
  const n = $("#voiceNote");
  if (!n) return;
  const miss = S.lang === "lt" && voices.length && !ltVoice() && !S.manifest.lt.length;
  n.textContent = miss ? UI.lt.ltVoiceMissing : "";
  n.hidden = !miss;
}
function stopSpeech() {
  try { speechSynthesis.cancel(); } catch (e) {}
  if (S.audio) { S.audio.pause(); S.audio = null; }
}
// Speaks one line: Kris's ElevenLabs mp3 if listed in audio/manifest.json, else browser TTS.
function say(id, text, { rate = 1, lang = S.lang } = {}) {
  setCaption(text);
  stopSpeech();
  return new Promise((resolve) => {
    const done = () => { clearTimeout(timer); resolve(); };
    const timer = setTimeout(resolve, Math.max(2500, text.length * 110 / rate)); // safety net if onend never fires
    if (R.on && R.eleven) { // robot mode: Kris's ElevenLabs voice rendered by the studio server (/api/tts, cached there)
      const my = ++R.sayId;
      fetch(`/api/tts?text=${encodeURIComponent(text)}`).then((r) => (r.ok ? r.blob() : Promise.reject(r.status))).then((b) => {
        if (my !== R.sayId) return resolve();
        const a = new Audio(URL.createObjectURL(b)); a.playbackRate = rate; S.audio = a;
        a.onended = done; a.onerror = () => local(); a.play().catch(() => local());
      }).catch(() => (my === R.sayId ? local() : resolve()));
      return;
    }
    local();
    function local() {
      if (id && S.manifest[lang] && S.manifest[lang].includes(id)) {
        const a = new Audio(`audio/${lang}/${id}.mp3`); a.playbackRate = rate; S.audio = a;
        a.onended = done; a.onerror = () => tts(); a.play().catch(() => tts());
        return;
      }
      tts();
    }
    function tts() {
      if (!("speechSynthesis" in window)) return;
      let t = text, v = lang === "lt" ? ltVoice() : enVoice();
      if (lang === "lt" && !v) { // no LT voice in this browser: speak the English version, note is visible
        const en = id && SPEECH_EN[id]; if (en) t = en; v = enVoice();
      }
      const u = new SpeechSynthesisUtterance(t);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === "lt" ? "lt-LT" : "en-US";
      u.rate = Math.min(1.3, Math.max(0.6, 0.95 * rate * (S.tempo > 1 ? 1.1 : S.tempo < 1 ? 0.9 : 1)));
      u.onend = done; u.onerror = done;
      speechSynthesis.speak(u);
    }
  });
}
const SPEECH_EN = {};
for (const [k, v] of Object.entries(PHRASES)) SPEECH_EN[k] = v.en;
for (const a of ASANAS) { SPEECH_EN[`${a.id}_intro`] = introText(a, "en"); SPEECH_EN[`${a.id}_explain`] = explainText(a, "en"); }

function setCaption(t) { $("#caption").textContent = t; }

// ---------- runner ----------
const T = () => UI[S.lang];
const sleep = (ms, sig) => new Promise((r) => { const id = setTimeout(r, ms); sig && sig.addEventListener("abort", () => { clearTimeout(id); r(); }); });

function newCtrl() { if (S.ctrl) S.ctrl.abort(); S.ctrl = new AbortController(); return S.ctrl.signal; }

async function start() {
  if (S.phase === "running") return;
  S.stopped = false; S.paused = false;
  if (S.phase === "idle" || S.phase === "done" || S.phase === "stopped") { S.idx = S.idx >= S.flow.length ? 0 : S.idx; S.hold = null; }
  track("class_start", { level: S.level });
  run(S.phase === "idle" && S.idx === 0);
}

async function run(welcome = false) {
  const my = ++S.runId, sig = newCtrl();
  S.phase = "running"; render();
  if (welcome) { await say("welcome", PHRASES.welcome[S.lang]); if (my !== S.runId) return; }
  while (S.idx < S.flow.length) {
    const a = S.flow[S.idx];
    renderCard();
    const resumeHold = S.hold != null;
    if (!resumeHold) {
      const kf0 = full(a.kf[0]);
      robotPlay(a); // 🤖 queued: starts after the previous robot move has finished
      await Promise.all([say(`${a.id}_intro`, introText(a, S.lang)), robot.moveTo(kf0, moveDur(robot.q, kf0, S.tempo) * 1000, sig)]);
      if (my !== S.runId) return;
      S.hold = a.hold;
    } else {
      const kf0 = full(a.kf[0]);
      await robot.moveTo(kf0, moveDur(robot.q, kf0, S.tempo) * 1000, sig);
      if (my !== S.runId) return;
    }
    // hold with breaths; poses with several keyframes cycle through them
    const breath = a.hold / a.breaths;
    let j = 0;
    while (S.hold > 0.05) {
      const half = Math.min(S.hold, breath / 2);
      const inhale = Math.round((a.hold - S.hold) / (breath / 2)) % 2 === 0;
      setBreath(inhale);
      say(inhale ? "inhale" : "exhale", PHRASES[inhale ? "inhale" : "exhale"][S.lang]);
      if (a.kf.length > 1) {
        j = (j + 1) % a.kf.length; const q = full(a.kf[j]);
        const dur = Math.min(half, Math.max(0.8, moveDur(robot.q, q, S.tempo)));
        await robot.moveTo(q, dur * 1000, sig);
      } else await sleep(half * 1000, sig);
      if (my !== S.runId) return;
      S.hold -= half; renderTimer();
    }
    setBreath(null);
    S.hold = null;
    if (R.on && R.inflight) { await R.inflight; if (my !== S.runId) return; } // robot finishes rest → pose → rest first
    // check-in after each block
    if ((S.idx + 1) % BLOCK === 0 || S.idx + 1 === S.flow.length) {
      if (S.idx + 1 < S.flow.length) { const ok = await checkin(my); if (my !== S.runId || !ok) return; }
    }
    S.idx++;
  }
  S.phase = "done"; render();
  if (R.on) api("/api/end").catch(() => {}); // hand the arm back to Unitree's controller
  await robot.moveTo(full(REST_POSE), 2000, sig);
  say("done", PHRASES.done[S.lang]);
  track("class_done", { level: S.level });
}

function pause() {
  if (S.phase !== "running" && S.phase !== "checkin") return;
  S.runId++; if (S.ctrl) S.ctrl.abort(); stopSpeech(); closeCheckin();
  if (R.on) S.hold = null; // robot: current move finishes (back to rest), no new steps; Tęsti replays this pose
  S.phase = "paused"; render(); say("pause", PHRASES.pause[S.lang]);
}
function cont() {
  if (S.phase !== "paused") return;
  say("resume", PHRASES.resume[S.lang]).then(() => run());
  S.phase = "running"; render();
}
async function jump(d) {
  S.runId++; if (S.ctrl) S.ctrl.abort(); stopSpeech(); closeCheckin();
  if (R.on && R.inflight) await robotStop(); // stop the current robot move, then play the next one
  S.idx = Math.max(0, Math.min(S.flow.length - 1, S.idx + d)); S.hold = null;
  if (S.phase === "running" || S.phase === "checkin") run(); else { renderCard(); previewPose(); }
}
// STOP: abort everything and ease to the safe neutral pose in 2 s
async function stop() {
  robotStop(); // first thing: POST /api/stop
  S.runId++; if (S.ctrl) S.ctrl.abort(); stopSpeech(); closeCheckin();
  S.phase = "stopped"; S.hold = null; S.stopped = true; render(); setBreath(null);
  document.body.classList.add("flash"); setTimeout(() => document.body.classList.remove("flash"), 600);
  say("stop", PHRASES.stop[S.lang]);
  const sig = newCtrl();
  await robot.moveTo(full(REST_POSE), 2000, sig);
  track("stop", { level: S.level, idx: S.idx });
}
async function explain(slow = false) {
  const a = S.flow[S.idx]; if (!a) return;
  const wasRunning = S.phase === "running";
  if (wasRunning) pause();
  await say(`${a.id}_explain`, explainText(a, S.lang), { rate: slow ? 0.8 : 1 });
}
function setTempo(d) {
  S.tempo = Math.max(0.5, Math.min(1.5, +(S.tempo + d).toFixed(2)));
  say(d < 0 ? "slower" : "faster", PHRASES[d < 0 ? "slower" : "faster"][S.lang]);
  render(); renderSafety();
}

// Check-in: "Ar galime tęsti?" / "Ar viskas aišku?"  Ne → explain again slower, then ask again.
function checkin(my) {
  S.phase = "checkin"; render();
  const block = Math.floor(S.idx / BLOCK);
  const key = block % 2 ? "checkin_clear" : "checkin_continue";
  return new Promise(async (resolve) => {
    S.checkin = async (ans) => {
      closeCheckin();
      if (ans) { S.phase = "running"; render(); resolve(true); return; }
      await say("again_slow", PHRASES.again_slow[S.lang]);
      if (my !== S.runId) return resolve(false);
      const a = S.flow[S.idx], sig = S.ctrl.signal;
      const slowT = S.tempo; S.tempo = Math.max(0.5, S.tempo * 0.6);
      await robot.moveTo(full(REST_POSE), 1500, sig);
      await Promise.all([say(`${a.id}_explain`, explainText(a, S.lang), { rate: 0.8 }), robot.moveTo(full(a.kf[0]), moveDur(robot.q, full(a.kf[0]), S.tempo) * 1000, sig)]);
      S.tempo = slowT;
      if (my !== S.runId) return resolve(false);
      openCheckin(key); say(key, PHRASES[key][S.lang]);
    };
    openCheckin(key); say(key, PHRASES[key][S.lang]);
  });
}
function openCheckin(key) { $("#checkinQ").textContent = PHRASES[key][S.lang]; $("#checkin").hidden = false; }
function closeCheckin() { $("#checkin").hidden = true; }
function answer(v) { if (S.checkin && !$("#checkin").hidden) { const f = S.checkin; f(v); } }

// ---------- level / language ----------
function setLevel(n) {
  S.runId++; if (S.ctrl) S.ctrl.abort(); stopSpeech(); closeCheckin();
  if (R.on && R.inflight) robotStop();
  setCaption(""); S.level = n; S.flow = byLevel(n); S.idx = 0; S.hold = null; S.phase = "idle";
  track("level", { level: n });
  render(); renderCard(); renderList(); renderSafety(); previewPose();
  if (n >= 4) say("locked", PHRASES.locked[S.lang]);
}
function setLang(l) {
  S.lang = l; document.documentElement.lang = l;
  if (S.rec) { S.rec.lang = l === "lt" ? "lt-LT" : "en-US"; if (S.listening) { try { S.rec.stop(); } catch (e) {} } }
  render(); renderCard(); renderList(); renderSafety(); renderCommands(); updateVoiceNote();
}
async function previewPose() {
  const a = S.flow[S.idx]; if (!a) return;
  const sig = newCtrl(); const q = full(a.kf[0]);
  await robot.moveTo(q, moveDur(robot.q, q, 1.3) * 1000, sig);
}

// ---------- render ----------
function render() {
  const t = T();
  document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = t[el.dataset.t]));
  $("#levels").innerHTML = LEVELS.map((L) => `<button class="lvl ${L.n === S.level ? "on" : ""} ${L.robot ? "" : "lock"}" data-level="${L.n}" aria-pressed="${L.n === S.level}">${L.n}${L.robot ? "" : " 🔒"}</button>`).join("");
  $("#levelName").textContent = LEVELS[S.level - 1][S.lang];
  $("#langBtn").textContent = S.lang === "lt" ? "EN" : "LT";
  $("#state").textContent = { idle: t.idle, running: "▶", paused: t.paused, stopped: t.stopped, done: t.done, checkin: "?" }[S.phase] || "";
  $("#btnStart").hidden = !(S.phase === "idle" || S.phase === "done" || S.phase === "stopped");
  $("#btnPause").hidden = !(S.phase === "running" || S.phase === "checkin");
  $("#btnCont").hidden = S.phase !== "paused";
  $("#tempo").textContent = `${t.tempo} ×${S.tempo.toFixed(2)}`;
  $("#lockBanner").hidden = S.level < 4; $("#lockBanner").textContent = t.locked;
  $("#hint").textContent = S.phase === "idle" ? t.tapToStart : "";
  document.querySelectorAll(".tab").forEach((b, i) => (b.textContent = t.tabs[i]));
  renderTimeline(); renderRobot();
}
function renderCard() {
  const a = S.flow[S.idx], t = T(); if (!a) return;
  $("#poseName").textContent = S.lang === "lt" ? a.lt : a.en;
  $("#poseSub").textContent = `${a.sa} · ${S.lang === "lt" ? a.en : a.lt}`;
  const b = $("#badge");
  b.textContent = a.locked ? `🔒 ${t.robotNo}` : a.robot ? t.robotYes : `${t.robotNo} · ${t.sim}`;
  b.className = "badge " + (a.robot ? "yes" : "no");
  $("#badgeNote").textContent = a.locked ? t.locked : a.robot ? t.robotNote : `${t.robotNote}`;
  $("#cues").innerHTML = a.cues[S.lang].map((c) => `<li>${c}</li>`).join("");
  $("#benefit").textContent = a.benefit[S.lang]; $("#caution").textContent = a.caution[S.lang];
  $("#poseCount").textContent = `${t.pose} ${S.idx + 1} ${t.of} ${S.flow.length}`;
  $("#simTag").hidden = a.robot;
  renderTimer(); renderTimeline();
}
function renderTimer() {
  const a = S.flow[S.idx], t = T(); if (!a) return;
  const left = S.hold != null ? Math.ceil(S.hold) : a.hold;
  $("#timer").textContent = `${t.hold} ${left} s · ${a.breaths} ${t.breaths}`;
}
function renderTimeline() {
  $("#timeline").innerHTML = S.flow.map((a, i) => `<button class="tl ${i < S.idx ? "past" : ""} ${i === S.idx ? "now" : ""} ${(i + 1) % BLOCK === 0 && i + 1 < S.flow.length ? "blockEnd" : ""}" data-idx="${i}" title="${a.sa}">${i + 1}<span>${S.lang === "lt" ? a.lt : a.en}</span></button>`).join("");
}
function setBreath(inhale) {
  const el = $("#breath");
  el.className = "breath " + (inhale == null ? "" : inhale ? "in" : "out");
  el.textContent = inhale == null ? "" : PHRASES[inhale ? "inhale" : "exhale"][S.lang];
}
function renderList() {
  $("#poseList").innerHTML = LEVELS.map((L) => `<h4>${L[S.lang]}</h4><ul>` + byLevel(L.n).map((a) => `<li><b>${S.lang === "lt" ? a.lt : a.en}</b> · <i>${a.sa}</i> · ${a.robot ? "🤖" : "🖥️"}${a.locked ? " 🔒" : ""}</li>`).join("") + "</ul>").join("");
}
function renderCommands() {
  $("#cmdList").innerHTML = COMMANDS.filter((c) => !["yes", "no"].includes(c.act) || true).map((c) => `<li><b>${c[S.lang][0]}</b> <span>${c[S.lang].slice(1).join(" · ")}</span></li>`).join("");
}
function renderSafety() {
  const t = T();
  const rows = S.flow.map((a) => {
    const s = safety(a, S.tempo);
    const fl = s.flags.length ? s.flags.map((f) => `<span class="${f.lvl}">${f.lvl === "err" ? "⛔" : "⚠️"} ${f.msg}</span>`).join("<br>") : t.ok;
    return `<tr><td>${S.lang === "lt" ? a.lt : a.en}</td><td>${a.robot ? "🤖" : "🖥️"}${a.locked ? "🔒" : ""}</td><td>${s.peak.toFixed(2)} rad/s <small>${s.peakJ}</small></td><td>${(s.pct * 100).toFixed(0)}% <small>${s.pctJ}</small></td><td>${fl}</td></tr>`;
  }).join("");
  $("#safetyTable").innerHTML = `<thead><tr>${t.safetyHead.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody>`;
  $("#safetyNote").textContent = S.lang === "lt"
    ? `Ribos: R1 MuJoCo modelis. Greičio riba rankoms ${CAP.arm} rad/s (r1ctl: movej ≤ ${CAP.r1ctlMovej}, kietoji ${CAP.r1ctlHard} rad/s). Tempas ×${S.tempo.toFixed(2)}. Tikrinamos tik viršutinės kūno dalies (roboto) sąnarių ribos ir greičiai; kojos ir pasvirimas tik simuliacijai. Susidūrimai su kūnu NEtikrinami ⚠️.`
    : `Limits: R1 MuJoCo model. Arm speed cap ${CAP.arm} rad/s (r1ctl: movej ≤ ${CAP.r1ctlMovej}, hard ${CAP.r1ctlHard} rad/s). Tempo ×${S.tempo.toFixed(2)}. Only upper-body (robot) joints are checked for limits and speed; legs and tilt are sim only. Self-collision is NOT checked ⚠️.`;
  const lockedEx = S.level >= 4;
  $("#btnExport").disabled = lockedEx; $("#exportNote").textContent = lockedEx ? t.exportLocked : "";
}
function download(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function doExport() {
  if (S.level >= 4) return;
  const name = `joga_l${S.level}`, ex = buildExport(S.flow, S.lang, name, `R1 Joga · ${LEVELS[S.level - 1][S.lang]}`);
  download(`${name}.yaml`, ex.yaml); download(`${name}.csv`, ex.csv);
  $("#exportNote").textContent = `✅ ${name}.yaml + ${name}.csv · ${ex.rows} eil. · ${ex.seconds.toFixed(0)} s · 50 Hz`;
  track("export", { level: S.level });
}

// ---------- 🤖 robot mode: only when this page is served by R1 Studio (http://<robot>:8080/joga/) ----------
// GitHub Pages (https) cannot reach the robot (mixed content, no CORS), so there the page stays sim-only.
// Off by default; on = GO typed. Each pose = one r1ctl arm move joga_l<level>_<id> via POST /api/step.
// The server moves the real robot only when started with --live; otherwise it logs a dry run.
const R = { studio: false, liveAllowed: false, eleven: false, on: false, inflight: null, gen: 0, sayId: 0 };
const STUDIO_PROBE = location.protocol === "http:" && (location.pathname.startsWith("/joga/") || /[?&]studio=1\b/.test(location.search));
async function api(path, body = {}) {
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}
async function probeStudio() {
  if (!STUDIO_PROBE) return;
  try {
    const s = await (await fetch("/api/status", { cache: "no-store" })).json();
    if (typeof s.live_allowed === "boolean") { R.studio = true; R.liveAllowed = s.live_allowed; R.eleven = !!s.eleven; robotLog(T().rStudio); }
  } catch (e) {}
  renderRobot();
}
function robotLog(m) { const el = $("#robotLog"); if (el) el.textContent = m; }
const robotPoseOk = (a) => a && a.level <= 3 && !a.locked;
function robotPlay(a) {
  if (!R.on || !robotPoseOk(a)) return;
  const gen = R.gen, name = poseMoveName(a), prev = R.inflight || Promise.resolve();
  const p = prev.then(async () => {
    if (!R.on || gen !== R.gen) return; // stopped or skipped while waiting
    robotLog(`▶ ${name}`);
    const r = await api("/api/step", { step: { arm_traj: { file: name, speed: Math.min(1, S.tempo) } }, live: true });
    robotLog(r.live ? `✅ ${name}` : `🧪 ${name}: dry-run, niekas nejuda`);
  }).catch((e) => robotLog(`❌ ${name}: ${e.message}`));
  R.inflight = p; p.finally(() => { if (R.inflight === p) R.inflight = null; });
}
async function robotStop() {
  if (!R.studio) return;
  R.gen++;
  const req = fetch("/api/stop", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
  robotLog("🛑 STOP → /api/stop");
  await req;
  if (R.inflight) await Promise.race([R.inflight, sleep(8000)]);
}
function goGate() {
  return new Promise((resolve) => {
    const t = T(); $("#goTitle").textContent = t.goTitle; $("#goAsk").textContent = t.goAsk;
    $("#goList").innerHTML = t.goList.map((x) => `<li>${x}</li>`).join("");
    $("#goInput").value = ""; $("#goModal").hidden = false; $("#goInput").focus();
    const close = (v) => { $("#goModal").hidden = true; $("#goOk").onclick = $("#goCancel").onclick = $("#goInput").onkeydown = null; resolve(v); };
    $("#goOk").onclick = () => close($("#goInput").value.trim().toUpperCase() === "GO");
    $("#goCancel").onclick = () => close(false);
    $("#goInput").onkeydown = (e) => { if (e.key === "Enter") $("#goOk").click(); if (e.key === "Escape") close(false); };
  });
}
async function toggleRobot() {
  if (!R.studio) return;
  if (R.on) { await robotStop(); R.on = false; api("/api/end").catch(() => {}); track("robot_off"); }
  else if (await goGate()) { R.on = true; track("robot_on", { live: R.liveAllowed }); }
  renderRobot();
}
function renderRobot() {
  const t = T();
  $("#robotNote").hidden = R.studio; $("#robotNote").textContent = t.rNote;
  $("#robotBtn").hidden = !R.studio; $("#robotBtn").textContent = R.on ? t.rOn : t.rOff; $("#robotBtn").setAttribute("aria-pressed", R.on);
  const c = $("#robotChip"); c.hidden = !R.studio; c.textContent = R.liveAllowed ? t.rLive : t.rDry; c.classList.toggle("live", R.liveAllowed && R.on);
}
addEventListener("pagehide", () => { if (R.on) navigator.sendBeacon("/api/stop", "{}"); });
window.__r1joga.R = R;

// ---------- voice commands ----------
function act(a) {
  ({ start, pause, cont, stop, next: () => jump(1), back: () => jump(-1), explain: () => explain(),
    slower: () => setTempo(-0.25), faster: () => setTempo(0.25),
    cmds: () => showTab(1), poses: () => showTab(2),
    lang_en: () => setLang("en"), lang_lt: () => setLang("lt"),
    yes: () => answer(true), no: () => answer(false) }[a] || (() => {}))();
}
function matchCommand(text) {
  const t = " " + text.toLowerCase().replace(/[.,!?]/g, "") + " ";
  // longest phrase first, both languages (people mix them)
  const all = COMMANDS.flatMap((c) => [...c.lt, ...c.en].map((p) => [p, c.act])).sort((a, b) => b[0].length - a[0].length);
  for (const [p, a] of all) if (t.includes(" " + p + " ")) return a;
  return null;
}
function toggleMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { $("#heard").textContent = T().micNo; return; }
  if (S.listening) { S.listening = false; try { S.rec.stop(); } catch (e) {} $("#micBtn").textContent = T().mic; return; }
  S.rec = new SR(); S.rec.continuous = true; S.rec.interimResults = false; S.rec.lang = S.lang === "lt" ? "lt-LT" : "en-US";
  S.rec.onresult = (e) => {
    const r = e.results[e.results.length - 1][0].transcript.trim();
    const a = matchCommand(r);
    $("#heard").textContent = `„${r}" → ${a || "?"}`;
    if (a) act(a);
  };
  S.rec.onend = () => { if (S.listening) try { S.rec.start(); } catch (e) {} };
  S.rec.onerror = (e) => { $("#heard").textContent = "mic: " + e.error; if (e.error === "not-allowed") S.listening = false; };
  S.listening = true; S.rec.start(); $("#micBtn").textContent = T().micOn;
}

// ---------- controller mock + keyboard ----------
const pressed = new Set();
let lastL1 = 0;
function pad(btn, down) {
  if (down) pressed.add(btn); else pressed.delete(btn);
  document.querySelector(`[data-pad="${btn}"]`)?.classList.toggle("down", down);
  if (!down) return;
  if (btn === "L1") lastL1 = performance.now();
  if ((pressed.has("L1") && pressed.has("R1")) || (btn === "R1" && performance.now() - lastL1 < 1200)) { stop(); return; }
  ({ A: () => (S.phase === "paused" ? cont() : start()), B: pause, X: () => explain(), Y: () => jump(1) }[btn] || (() => {}))();
}
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input,textarea")) return;
  if (e.key === "Escape") { e.preventDefault(); stop(); }
  else if (e.key === " ") { e.preventDefault(); S.phase === "paused" ? cont() : S.phase === "running" || S.phase === "checkin" ? pause() : start(); }
  else if (e.key === "ArrowRight") jump(1);
  else if (e.key === "ArrowLeft") jump(-1);
  else if (e.key.toLowerCase() === "e") explain();
});

function showTab(i) {
  document.querySelectorAll(".tab").forEach((b, j) => b.classList.toggle("on", i === j));
  document.querySelectorAll(".panel").forEach((p, j) => (p.hidden = i !== j));
}

// ---------- wire up ----------
document.addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.level) setLevel(+b.dataset.level);
  else if (b.dataset.idx != null && b.classList.contains("tl")) { const d = +b.dataset.idx - S.idx; jump(d); }
  else if (b.dataset.tab != null) showTab(+b.dataset.tab);
});
$("#btnStart").onclick = start; $("#btnPause").onclick = pause; $("#btnCont").onclick = cont;
$("#btnNext").onclick = () => jump(1); $("#btnBack").onclick = () => jump(-1);
$("#btnExplain").onclick = () => explain(); $("#btnStop").onclick = stop;
$("#btnSlower").onclick = () => setTempo(-0.25); $("#btnFaster").onclick = () => setTempo(0.25);
$("#yes").onclick = () => answer(true); $("#no").onclick = () => answer(false);
$("#langBtn").onclick = () => setLang(S.lang === "lt" ? "en" : "lt");
$("#micBtn").onclick = toggleMic; $("#btnExport").onclick = doExport; $("#robotBtn").onclick = toggleRobot;
document.querySelectorAll("[data-pad]").forEach((el) => {
  el.addEventListener("pointerdown", (e) => { e.preventDefault(); pad(el.dataset.pad, true); });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => el.addEventListener(ev, () => { if (pressed.has(el.dataset.pad)) pad(el.dataset.pad, false); }));
});
document.querySelectorAll("[data-view]").forEach((b) => (b.onclick = () => robot.view(b.dataset.view)));

(async () => {
  try { S.manifest = await (await fetch("audio/manifest.json")).json(); } catch (e) {}
  await robot.load("model/r1.json");
  robot.set(full(REST_POSE));
  $("#loading").hidden = true;
  render(); renderCard(); renderList(); renderCommands(); renderSafety(); showTab(0); updateVoiceNote();
  previewPose(); probeStudio();
})();
