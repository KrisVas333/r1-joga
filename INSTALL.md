# R1 Joga → tikras Unitree R1 · įdiegimas ir paleidimas

**Atnaujinta:** 2026-10-31 · 🇱🇹 pirma, 🇬🇧 English below
**Būsena:** ✅ veikia simuliatoriuje (R1 Studio serveris be `--live`, Chrome, 2026-10-31) · ⚠️ dar NIEKADA nepaleista ant tikro roboto.

> **Taisyklė visam dokumentui:** jei kažkas atrodo ne taip, kaip parašyta „Turi matyti", **STOP**: nespausk toliau, nuspausk **Esc / ■ STOP** naršyklėje ir pulteliu sustabdyk robotą. Klausk prieš tęsdamas.

Kaip tai veikia: GitHub Pages puslapis (`https://`) negali kalbėti su robotu (`http://192.168.123.164`). Todėl ant roboto jogos programą **rodo pats R1 Studio serveris** adresu `http://192.168.123.164:8080/joga/`. Ten atsiranda mygtukas **🤖 Robotas**. Kiekviena poza = vienas r1ctl judesys `joga_l<lygis>_<poza>` (tik rankos, liemuo, galva; kojas laiko Unitree pusiausvyros valdiklis).

---

## A. Mac paruošimas (vieną kartą, ~20 min)

**A1. Studio kodas (šaka `joga`).**
```bash
cd ~/r1 && git remote -v
```
Turi matyti: `origin … KrisVas333/r1-studio`. **STOP**, jei nieko nerodo arba kitas repo: `~/r1` nėra git kopija, parašyk Neuron'ui.
```bash
git fetch origin && git checkout joga && git pull
grep -c joga studio/server.py deploy.sh
```
Turi matyti: du skaičius > 0 (pvz. `studio/server.py:17`, `deploy.sh:9`).

**A2. Jogos programa į `~/r1/r1-joga`.**
```bash
cd ~/r1 && git clone https://github.com/KrisVas333/r1-joga r1-joga   # jei jau yra: cd r1-joga && git pull
cd ~/r1/r1-joga && python3 tools/check_exports.py ~/r1/r1ctl
```
Turi matyti pabaigoje: `46 / 46 pass`. **STOP**, jei yra ❌.

**A3. ElevenLabs raktas (jei dar nėra).** Raktą nukopijuok iš elevenlabs.io → Profile → API keys, tada:
```bash
mkdir -p ~/.config/elevenlabs && pbpaste > ~/.config/elevenlabs/key && chmod 600 ~/.config/elevenlabs/key
```
Raktas niekada neįdedamas į repo ir niekur nespausdinamas.

**A4. Balso testas (1 sakinys).**
```bash
cd ~/r1/r1-joga && python3 tools/make_voice.py --test
```
Turi matyti: `🔑 key found in ~/.config/elevenlabs/key (not shown)` → `✅ model that worked: eleven_v4_turbo` (arba `eleven_multilingual_v2`, jei v4 atmetė LT) ir **išgirsti savo balsą lietuviškai**. **STOP**, jei balsas ne tavo arba lietuvių kalba sugadinta: nepaleisk pilno generavimo.

**A5. Visas balsas (~15 500 simbolių, LT + EN).**
```bash
python3 tools/make_voice.py            # jei A4 parodė multilingual: python3 tools/make_voice.py --model eleven_multilingual_v2
```
Turi matyti: daug `ok audio/lt/…mp3` eilučių ir pabaigoje `manifest: lt 65, en 65`.

**A6. Įkelk balsą į GitHub (puslapis viešas).**
```bash
git add audio && git commit -m "Kris voice (ElevenLabs)" && git push
```
Turi matyti: `master -> master`. Po ~1 min https://krisvas333.github.io/r1-joga/ kalba tavo balsu.

---

## B. Ofise su robotu (~60 min, 2 žmonės)

Saugumas visą laiką: **robotas ant kėlimo rėmo (gantry)** pirmiems bandymams · **pultelis rankoje** antram žmogui · **2 m laisvai**, vaikai už linijos · jokių pirštų plaštakose.

**B1. Kabelis.** USB-C Ethernet adapteris → robotas (developer port). Įjunk robotą, pakelk pulteliu (laikyk už galinės rankenos).

**B2. Tinklas.**
```bash
cd ~/r1 && ./connect.sh            # parodo adapterius, rask „USB 10/100/1000 LAN", pvz. en7
./connect.sh en7
```
Turi matyti: `✅ 192.168.123.164 answers`. **STOP** jei `❌`: žr. D lentelę.

**B3. ElevenLabs raktas į robotą (vieną kartą, kad /api/tts veiktų).**
```bash
ssh unitree@192.168.123.164 'mkdir -p ~/.config/elevenlabs' && scp ~/.config/elevenlabs/key unitree@192.168.123.164:~/.config/elevenlabs/key
```

**B4. Kodas į robotą.**
```bash
cd ~/r1 && ./deploy.sh
```
Turi matyti: `🧘 copied r1-joga → PC2:~/r1-kit/r1-joga`, eilutes `✅ installed arm/joga_l1_tadasana` … ir `joga arm moves in library: 23`. **STOP**, jei `⚠️ no r1-joga/index.html` (grįžk į A2) arba kompiliavimo klaida.

**B5. Serveris ant roboto.**
```bash
ssh unitree@192.168.123.164
python3 ~/r1-kit/studio/server.py --live
```
Turi matyti: `R1 Studio · LIVE ROBOT mode`, `🧘 yoga app: …/joga/` ir saugumo eilutę `⚠️ LIVE: gantry …`. Šis terminalas = žurnalas: kiekvienas judesys čia matomas.

**B6. Mac Chrome:** atidaryk `http://192.168.123.164:8080/joga/`. Turi matyti: viršuje **🤖 Robotas: išjungtas** ir raudoną žymą **LIVE**. Jei rodo `DRY-RUN`: serveris paleistas be `--live` (taip ir saugiau pirmam patikrinimui).

**B7. Įjunk robotą puslapyje:** 🤖 Robotas → perskaityk sąrašą → įrašyk `GO` → Enter. Mygtukas tampa raudonas „ĮJUNGTAS".

**B8. Pirmas judesys: 1 lygis, 1 poza (Kalnas), robotas ant gantry.** Spausk ▶ Pradėti, po pasisveikinimo robotas daro Kalną (~17 s, rankos beveik nejuda). Serverio terminale turi matyti `▶ arm_traj` be klaidų. **STOP (Esc)** jei: ranka juda į kitą pusę nei ekrane · trūkčioja · girdisi neįprastas garsas. Tada pirmas klausimas: sąnarių kryptys (žr. R1 Studio README ⚠️1).

**B9. Po vieną pozą:** ▶▶ Kitas (sustabdo dabartinę, groja kitą). Pauzė = robotas baigia dabartinę pozą ir grįžta į ramybę, naujų nesiunčia; Tęsti = pakartoja pozą. Kiekviena poza prasideda ir baigiasi ramybės padėtyje.

**B10. Visas 1 lygis** (8 pozos, ~3,5 min) tik kai visos 8 praėjo po vieną.

**B11. 2 ir 3 lygiai:** robotas rodo **tik rankų dalį** (kojos lieka stovėti). Pirmiausia ant gantry, po vieną pozą.

**Baigus:** 🤖 Robotas išjungti (atiduoda rankas Unitree valdikliui) → serverio terminale Ctrl-C.

---

## C. Pultelis (vėliau, atskirai)

⚠️ Pultelio mygtukai **dar nesujungti** su jogos puslapiu; šiandien valdai Mac klaviatūra/pele.
1. Pirmiausia tik skaityk: ant PC2 `ls ~/r1-kit/unitree_sdk2/build/bin | grep -i -E "wireless|controller"` ir paleisk rastą pavyzdį, kuris skaito `rt/wirelesscontroller`. Spausk mygtukus, užrašyk, ką rodo. (⚠️ ar R1 SDK turi šį pavyzdį, nepatikrinta.)
2. Siūlomas žemėlapis: **A** pradėti/tęsti · **B** pauzė · **X** paaiškink · **Y** kitas · **L1+R1** STOP.
3. **Niekada** nenaudok **L2+B** (damping / avarinis) ir **R2+A** (atsistojimas): jie priklauso Unitree ir turi likti saugos mygtukais.

---

## D. Problemos

| Simptomas | Ką daryti |
|---|---|
| `❌ 192.168.123.164 no answer` | Kitas adapteris (`./connect.sh` be argumento) · kabelis į developer portą · robotas pilnai užsikrovęs (~1 min) · `ping 192.168.123.161` |
| SSH klausia slaptažodžio | Dažnai `123` ⚠️ patvirtinti su Droni. Neveikia → STOP, klausk Droni |
| `arm_sdk occupied` / jau valdo kita programa (ID 7400–7407) | Ant PC2: `~/r1-kit/unitree_sdk2/build/bin/r1_arm_action_example eth0 --id 99` (release), tada vėl 🤖 Robotas. Tik viena valdymo programa vienu metu |
| Puslapyje `❌ joga_l1_…: not found` | Judesiai neįdiegti: `python3 ~/r1-kit/r1ctl/r1ctl.py install ~/r1-kit/r1-joga/export` ant PC2 |
| `robot is busy with another step` | Palauk, kol baigsis poza, arba ■ STOP |
| Senka baterija / robotas linksta | STOP, nuleisk ant gantry, krauk. Nebandyk „dar vienos pozos" |
| Nėra LT balso | `/api/tts` reikia rakto ant PC2 (B3). Be jo kalba Mac naršyklė; Chrome dažnai neturi LT balso → kalba angliškai |
| Garsas ne iš roboto | Taip ir turi būti: balsas groja **Mac** naršyklėje (prijunk kolonėlę). Garsas per roboto garsiakalbį = kitas žingsnis |

---

## E. Sąžiningai: ko robotas NEDARYS

- **Kojų:** jokių pritūpimų, stovėjimo ant vienos kojos, žingsnių. Kojas valdo Unitree pusiausvyros valdiklis; mūsų failai jų neliečia.
- **Grindų ir apsivertimų:** 4–6 lygiai užrakinti robotui (tik ekrane). Kritimas = sugadintas €€€ robotas.
- **Savo kūno susidūrimų tikrinimo** ant tikro roboto nėra: tikrinta tik sąnarių ribos ir greitis (≤ 1 rad/s).

**2 fazė: viso kūno joga (savaitės, ne dienos).** GMR_R1 (žmogaus judesio retarget'as į R1) → R1 sekimo užduotis **mjlab** ant RTX 4090 (WSL2) → validacija simuliacijoje → gantry. Įvertis **6–10 savaičių** ⚠️, ir **reikia Unitree garantijos patvirtinimo** prieš bet kokį savo kojų valdiklį.

---
---

# R1 Yoga → the real Unitree R1 · install and run (EN)

**Status:** ✅ works in the simulator (R1 Studio server without `--live`, Chrome, 2026-10-31) · ⚠️ never run on the real robot yet.

> **Rule for this whole guide:** if anything differs from "Expect", **STOP**: press **Esc / ■ STOP** in the browser and stop the robot with the remote. Ask before going on.

How it works: the GitHub Pages page (`https://`) cannot talk to the robot (`http://192.168.123.164`), so on the robot the **R1 Studio server serves the yoga app** at `http://192.168.123.164:8080/joga/`. There a **🤖 Robot** button appears. Each pose = one r1ctl move `joga_l<level>_<pose>` (arms, waist, head only; Unitree's balance controller keeps the legs).

## A. Mac prep (once, ~20 min)
1. **Studio code (branch `joga`).** `cd ~/r1 && git remote -v` → expect `KrisVas333/r1-studio`; **STOP** if not. Then `git fetch origin && git checkout joga && git pull`; `grep -c joga studio/server.py deploy.sh` → two numbers > 0.
2. **Yoga app into `~/r1/r1-joga`.** `cd ~/r1 && git clone https://github.com/KrisVas333/r1-joga r1-joga` then `cd ~/r1/r1-joga && python3 tools/check_exports.py ~/r1/r1ctl` → expect `46 / 46 pass`; **STOP** on any ❌.
3. **ElevenLabs key** (if missing): copy it from elevenlabs.io → `mkdir -p ~/.config/elevenlabs && pbpaste > ~/.config/elevenlabs/key && chmod 600 ~/.config/elevenlabs/key`. Never in the repo, never printed.
4. **Voice test:** `python3 tools/make_voice.py --test` → expect `✅ model that worked: eleven_v4_turbo` (or `eleven_multilingual_v2`) and you hear your own voice in Lithuanian. **STOP** if it is not your voice or the Lithuanian is broken.
5. **Full voice:** `python3 tools/make_voice.py` (add `--model eleven_multilingual_v2` if step 4 said so) → expect `manifest: lt 65, en 65`.
6. **Publish voice:** `git add audio && git commit -m "Kris voice (ElevenLabs)" && git push` → expect `master -> master`.

## B. Office with the robot (~60 min, 2 people)
Always: **gantry** for first runs · **remote in the second person's hand** · **2 m clear**, kids behind the line · no fingers in the hands.
1. **Cable:** USB-C Ethernet → developer port; power on, stand it up with the remote.
2. **Network:** `cd ~/r1 && ./connect.sh` (find the USB LAN device) → `./connect.sh en7` → expect `✅ 192.168.123.164 answers`. **STOP** on ❌ (see D).
3. **Key to the robot (once):** `ssh unitree@192.168.123.164 'mkdir -p ~/.config/elevenlabs' && scp ~/.config/elevenlabs/key unitree@192.168.123.164:~/.config/elevenlabs/key`
4. **Deploy:** `cd ~/r1 && ./deploy.sh` → expect `🧘 copied r1-joga`, `✅ installed arm/joga_l1_tadasana` …, `joga arm moves in library: 23`. **STOP** on `⚠️ no r1-joga/index.html` or a build error.
5. **Server on the robot:** `ssh unitree@192.168.123.164` → `python3 ~/r1-kit/studio/server.py --live` → expect `LIVE ROBOT mode`, `🧘 yoga app: …/joga/`, the safety line. Keep this terminal visible: it logs every move.
6. **Mac Chrome:** `http://192.168.123.164:8080/joga/` → expect **🤖 Robotas: išjungtas** + red **LIVE** tag (`DRY-RUN` = server without `--live`).
7. **Turn robot mode on:** 🤖 → read the list → type `GO` → Enter.
8. **First move: Level 1, pose 1 (Mountain), on the gantry.** ▶ Start; after the welcome the robot does Mountain (~17 s, arms barely move). Server log shows `▶ arm_traj`, no errors. **STOP (Esc)** if an arm moves the opposite way to the screen, jerks, or sounds wrong: then joint directions are question 1.
9. **One pose at a time:** ▶▶ Next (stops current, plays next). Pause = robot finishes the current pose back to rest, sends nothing new; Continue = replays it. Every pose starts and ends at rest.
10. **Full Level 1** (8 poses, ~3.5 min) only after all 8 passed one by one.
11. **Levels 2/3:** robot shows the **arm part only** (legs stay standing). Gantry first, one pose at a time.
Done: turn 🤖 off (hands the arm back to Unitree's controller) → Ctrl-C the server.

## C. Remote (later, separately)
⚠️ Remote buttons are **not wired** to the yoga page yet. First read-only: on PC2 `ls ~/r1-kit/unitree_sdk2/build/bin | grep -i -E "wireless|controller"`, run the example that reads `rt/wirelesscontroller`, press buttons, note what prints (⚠️ unverified that the R1 SDK ships one). Proposed map: **A** start/continue · **B** pause · **X** explain · **Y** next · **L1+R1** STOP. **Never** reuse **L2+B** (damping/e-stop) or **R2+A** (stand up).

## D. Troubleshooting
| Symptom | Fix |
|---|---|
| No ping to .164 | Other adapter (`./connect.sh`) · cable in the developer port · wait ~1 min for boot · `ping 192.168.123.161` |
| SSH asks for a password | Often `123` ⚠️ confirm with Droni; wrong → STOP, ask Droni |
| arm_sdk occupied (ID 7400–7407) | On PC2: `~/r1-kit/unitree_sdk2/build/bin/r1_arm_action_example eth0 --id 99` (release), then 🤖 again. One control program at a time |
| `❌ joga_l1_…: not found` | `python3 ~/r1-kit/r1ctl/r1ctl.py install ~/r1-kit/r1-joga/export` on PC2 |
| `robot is busy with another step` | Wait for the pose to end, or ■ STOP |
| Low battery / robot sags | STOP, lower onto the gantry, charge |
| No LT voice | `/api/tts` needs the key on PC2 (B3); without it the Mac browser speaks, Chrome often lacks LT → English |
| Sound not from the robot | Expected: voice plays in the **Mac** browser (use a speaker). Robot speaker = next step |

## E. Honest box: what the robot will NOT do
- **No legs** (no squats, one-leg balance, steps): Unitree's balance controller owns them.
- **No floor work, no inversions:** levels 4–6 locked for the robot (screen only).
- **No self-collision check** on the real robot: only joint limits and speed (≤ 1 rad/s) are checked.

**Phase 2: full-body yoga (weeks, not days).** GMR_R1 retarget (human motion → R1) → R1 tracking task in **mjlab** on the RTX 4090 (WSL2) → sim validation → gantry. Estimate **6–10 weeks** ⚠️, and **needs Unitree's warranty OK** before any custom leg controller.

---
⚗️ Eksperimentinis prototipas, sukurtas su AI. Gali klysti, svarbius dalykus pasitikrinkite. Nemokamas. Atsiliepimai laukiami: [krisvas.lt](https://krisvas.lt)
