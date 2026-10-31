# R1 Jogos Instruktorius · R1 Yoga Instructor (demo)

🇱🇹 Žiniatinklio demo: Unitree **R1 EDU Pro** (+ BrainCo Revo2 plaštakos) veda jogos pamoką. 3D simuliacija, balsas, pamokos valdymas, pultelio maketas, saugumo patikra ir eksportas į `r1ctl`.
🇬🇧 Web demo: a Unitree **R1 EDU Pro** robot leads a yoga class. 3D simulation, voice, class flow control, remote mock, safety check and export to `r1ctl`.

**Status 2026-10-31:** ✅ tested in Chrome (localhost) · ⚠️ robot NOT connected, nothing has run on the real R1.

## Paleisti · Run
```bash
python -m http.server 8000      # in this folder
# open http://localhost:8000/
```
No build step. three.js r160 is vendored. Works on phone and laptop. Speech recognition needs Chrome (lt-LT / en-US).

## Ką daro · What it does
- **6 lygiai · 26 asanos** (L1 8 · L2 6 · L3 6 · L4–6 2 each). Each pose: LT + Sanskrit + EN name, 3 cues per language, benefit, caution, hold time + breaths.
- **Pamokos eiga · Flow:** Pradėti · Pauzė · Tęsti · Kitas · Atgal · Paaiškink pozą · **STOP** (always visible, red; eases to a safe neutral in 2 s). Timeline is clickable. Tempo − / +.
- **Check-ins** after every block of 3 poses: „Ar galime tęsti?" / „Ar viskas aišku?" → Taip / Ne. **Ne** = explain again, slower (voice + slow motion), then ask again.
- **Balsas · Voice out:** plays `audio/<lang>/<id>.mp3` (Kris's ElevenLabs voice) if listed in `audio/manifest.json`, else the browser's speech synthesis. If the browser has no Lithuanian voice, it speaks the English line and shows a note.
- **Balso komandos · Voice commands** (🎤): pradėk, pauzė, tęsk, stop, kitas, atgal, paaiškink, lėčiau, greičiau, komandų sąrašas, asanų sąrašas, kalba anglų / lietuvių, taip / ne (+ English equivalents).
- **Valdiklis:** on-screen Unitree remote mock. PROPOSED map, *check with the robot*: A start/continue · B pause · X explain · Y next · **L1+R1 STOP**. Keyboard: Space pause/continue · Esc STOP · ← → · E explain.
- **Saugumo patikra · Safety check:** per pose peak joint speed (rad/s) and % of joint range used, flags beyond-limit keyframes and speeds over the cap (arms 1.0 rad/s; r1ctl itself caps movej at 1.5 and hard-limits at 2.0 rad/s).
- **Eksportas:** r1ctl `dance` YAML + arm CSV (t + 13 joints, 50 Hz, radians). Level 1–3 files are pre-built in `export/` and pass r1ctl's own `validate_file` + `check_csv`.

## 🤖 Robotas vs 🖥️ ekranas · Robot vs screen (the honest part)
On the real R1 **only the upper body** is driven by our code: arms (5 DOF each), waist yaw, head, hands. **Legs stay under Unitree's balance controller.**
- 🤖 **Robotas rodo** = the robot can show this pose with its upper body (all of Level 1 + Cow Face Arms).
- 🖥️ **Tik ekrane** = full body is shown in the simulation („simuliacija"); the robot gives the voice cues and the arm part only.
- **Levels 4–6 are 🔒 locked for the robot:** inversions / floor work are not safe for the robot. Screen preview only, no export.
- The sim also uses waist roll and a body tilt that the r1ctl CSV does not carry. Self-collision is not checked ⚠️.

## Kaip tai pateks į robotą · How flows run via r1ctl later
1. Copy `export/joga_l1.yaml` → `r1ctl/library/dances/`, `export/joga_l1.csv` → `r1ctl/library/arm/` (or `r1ctl install <path>`).
2. Dry run first: `r1ctl play joga_l1` (dry-run is the default; `--live` per r1ctl README only after the checks below).
3. Live only with: gantry, remote in hand (e-stop), 2 m clear, nobody near the arms.
⚠️ Not yet verified on hardware: elbow/shoulder sign conventions (checked on the MuJoCo model only), `say` vs arm timing (say is blocking in r1ctl, so the speech track can drift), interactive check-ins (a dance file cannot wait for an answer; needs an r1ctl event menu or the `ai` step), and the remote button map.

## Balsas · Kris's voice
```bash
node tools/build.mjs                 # data/speech.json + export/ from js/asanas.js
python tools/make_voice.py --dry-run # list lines, ~7.7k characters per language
python tools/make_voice.py           # ElevenLabs, voice 4IODp0ntCcYJIRzjBGVV, model eleven_v4_turbo
```
Key from `ELEVENLABS_API_KEY` or `~/.config/elevenlabs/key`. **Never commit the key.** ⚠️ Lithuanian on `eleven_v4_turbo` is untested; fallback `--model eleven_multilingual_v2`.

## Sekimas · Tracking
`js/track.js` is a **placeholder** (nothing is sent). Before any public launch: Microsoft Clarity + Supabase events behind the consent gate, then `bin/tracking-audit.py`.

## Failai · Files
`index.html` · `css/style.css` · `js/app.js` (runner, voice, UI) · `js/asanas.js` (poses + text) · `js/timeline.js` (timing, safety, export) · `js/robot.js` (3D) · `js/joints.js` (joint map, limits, caps) · `js/track.js` · `tools/build.mjs` · `tools/make_voice.py` · `export/` · `audio/`

## Licencijos · Licences
Code: © Kristijonas Vasiliauskas / Robotikos Akademija. R1 model: Unitree `unitree_mujoco`, **BSD-3** (see `NOTICE`). three.js: MIT.
⚗️ Eksperimentinis prototipas, sukurtas su AI. Gali klysti, svarbius dalykus pasitikrinkite. Nemokamas. Atsiliepimai laukiami: krisvas.lt

## 🤖 Tikras robotas / Real robot
Žingsnis po žingsnio: [INSTALL.md](INSTALL.md) (R1 Studio serveris rodo šią programą adresu `/joga/`, mygtukas 🤖 Robotas + GO). Per-pose r1ctl moves: `export/poses/`, check: `python3 tools/check_exports.py ~/r1/r1ctl`.
