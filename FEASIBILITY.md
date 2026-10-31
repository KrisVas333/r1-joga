# R1 Jogos Instruktorius — feasibility (2026-10-31)

✅ = verified from a source · ⚠️ = unverified / judgment. Probabilities are estimates.

## Verdict
- **Upper-body yoga on the real R1 = feasible. Whole-body yoga = not now (months, uncertain).**
- The robot speaks the pose and demonstrates the upper-body part (arms, waist, head); the full pose is shown on the screen sim.
- Hand-keyframed / teach-recorded poses beat a "100 h of YouTube → robot" pipeline for standing upper-body poses (no GPU, no retargeting, no sim2real).
- No R1 whole-body tracking exists (unitree_rl_mjlab tracking = G1 only; GMR R1 = fork, sim only). No R1/humanoid yoga project found on GitHub or Hugging Face.

## Probability
| Scenario | P | Time | Main failure mode |
|---|---|---|---|
| Web demo (sim + controller + voice + flow control) | **85 %** | today | LT voice quality / browser voice |
| Real R1 leads L1–3 upper-body yoga, LT voice, pause/stop, Mac UI | **50 %** (≈70 % if poses pre-tuned the day before) | 1 office day (6–8 h) | PC2 login, network, joint map, pose tuning |
| + Unitree remote button mapping | **35 %** | +1–2 h | topic `rt/wirelesscontroller` on R1 ⚠️, collisions with built-in combos |
| Full-body poses (lunges, one-leg balance, floor) | **≤ 5 %** this month | weeks–months | no R1 tracking policy; legs belong to Unitree's controller |

## What R1 can show (standing, balance mode; 5-DOF arms, waist roll ±30°, yaw ±150°, no waist pitch)
- 🟢 upper body: Mountain, Upward salute, Prayer, Side bend, Standing twist, Warrior II arms, Eagle arms, Cow-face arms, Tree arms (feet planted).
- 🟡 needs legs: Tree (one leg), Warrior I/II full, Triangle, Chair (maybe via `squat` loco cmd ⚠️), lunges.
- 🔴 unsafe/impossible: Warrior III, Half-moon, Dancer, Down Dog, Plank, Cobra, Bridge, Wheel, inversions, floor poses.
- Asana levels are our judgment → have a yoga teacher approve ⚠️.

## Office setup checklist
**Hardware:** R1 charged ≥ 50 % (low battery blocks arm actions ✅) · gantry/hoist · remote + spare batteries · USB-C Ethernet adapter + cable · Mac charger · speaker (play voice from the Mac day 1) · mic · 2 m clear floor · Revo2 hands off for day 1.
**Network:** `./connect.sh <iface>` (Mac 192.168.123.222) · ping .161 / .164 · `ssh unitree@192.168.123.164` (password ⚠️ ask Droni).
**Accounts:** ElevenLabs key + voice ID (test one LT sentence in v4 first) · second network for internet.
**Mac:** Colima + Docker `r1-dev` (built) · Chrome · Python 3.11 (`websockets`, `requests`).
**PC2:** `./deploy.sh` → `r1_arm_action_example --list` (photo) · `r1_teach_playback` · small HTTP/WebSocket daemon so the Mac UI sends play/pause/stop/say.
**Safety:** gantry attached for first motion · adult holds remote + STOP · one control program at a time · pause has a time limit (motor heat; poll `rt/lowstate` temps ⚠️) · stop = ramp arm_sdk weight to 0 · never `damp` without gantry · no kids within reach.

## Remote (SDK ✅)
`rt/wirelesscontroller` (`unitree_go::msg::dds_::WirelessController_`), 16-bit keys R1 L1 Start Select R2 L2 f1 f2 A B X Y up right down left + sticks. Proposed: Start = start/continue · Select = pause · f1+f2 held = STOP. Avoid L2+B / R2+A (system combos ⚠️).

## Voice
ElevenLabs v4 / v4 Turbo list Lithuanian ✅. v4 streams only via the Text-to-Dialogue WebSocket (no stop message → reconnect). Day 1: **pre-render ~40 coaching lines per language** and play from disk; live LLM speech only for free Q&A. LT listening: keywords + buttons, not open dictation.

## Top repos
unitree_sdk2 (core) · Mmaotttt/unitree_sdk2-modified (teach/playback, BSD-3) · ElevenLabs v4 Turbo · unitree_mujoco (R1 sim) · unitree_ros (URDF) · cooplabs/spur (read SAFETY.md only) · later: GMR, unitree_rl_mjlab/mjlab, whole_body_tracking · skip GVHMR (non-commercial).

## Risks
arm_sdk waist/head coverage on R1 ⚠️ · motor heat on long holds · LT clone on v4 untested · remote collisions · Unitree warranty on custom control unknown (ask in writing) · a human instructor must be present · say "upper-body demonstration" up front.
