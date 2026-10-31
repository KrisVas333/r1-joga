// R1 Jogos Instruktorius: asana library. Joint angles in radians (see js/joints.js for keys).
// robot: true  = 🤖 the real R1 can show this with its upper body (arms, waist yaw, head).
// robot: false = 🖥️ full body shown only in the simulation; the robot gives voice cues + the arm part.
// Conventions checked on the R1 model in this demo: shoulder pitch < 0 lifts the arm forward/up,
// elbow ≈ 1.4 = straight arm, elbow 0 = 90° bend; hip pitch < 0 lifts the thigh forward, knee > 0 bends.
// tx / tz = sim-only body tilt (forward < 0 · backward > 0 / sideways).

const REST = { lsp: 0, lsr: 0.08, lsy: 0, le: 1.35, lwr: 0, rsp: 0, rsr: -0.08, rsy: 0, re: 1.35, rwr: 0 };
const UP = { lsp: -2.9, lsr: 0.15, le: 1.45, rsp: -2.9, rsr: -0.15, re: 1.45 };
const T = { lsp: 0, lsr: 1.5, le: 1.45, rsp: 0, rsr: -1.5, re: 1.45 };
const PRAY = { lsp: -0.55, lsr: 0.1, lsy: -0.75, le: -0.75, rsp: -0.55, rsr: -0.1, rsy: 0.75, re: -0.75 };
const PRAY_UP = { lsp: -2.75, lsr: 0.05, le: 1.2, rsp: -2.75, rsr: -0.05, re: 1.2 };
const EAGLE = { lsp: -1.45, lsr: 0.05, lsy: -1.05, le: -0.35, rsp: -1.45, rsr: -0.05, rsy: 1.05, re: -0.35 };
const WIDE = { lhr: 0.38, rhr: -0.38, lar: -0.2, rar: 0.2 };
const k = (...parts) => Object.assign({}, REST, ...parts);

export const LEVELS = [
  { n: 1, lt: "1 lygis · Pradžia", en: "Level 1 · Start", robot: true },
  { n: 2, lt: "2 lygis · Stovint", en: "Level 2 · Standing", robot: true },
  { n: 3, lt: "3 lygis · Pusiausvyra", en: "Level 3 · Balance", robot: true },
  { n: 4, lt: "4 lygis · Rankos ir sėdėjimas", en: "Level 4 · Arms and seated", robot: false },
  { n: 5, lt: "5 lygis · Apsivertimai", en: "Level 5 · Inversions", robot: false },
  { n: 6, lt: "6 lygis · Gilūs atlenkimai", en: "Level 6 · Deep backbends", robot: false },
];

const P = (o) => ({ hold: 15, breaths: 3, ...o });

export const ASANAS = [
  // ---------- LEVEL 1 · all 🤖 (upper body only) ----------
  P({ id: "tadasana", level: 1, robot: true, lt: "Kalnas", sa: "Tadasana", en: "Mountain",
    cues: { lt: ["Stovėk tiesiai, pėdos kartu", "Pečiai atsipalaidavę, rankos šonuose", "Kvėpuok ramiai per nosį"],
            en: ["Stand tall, feet together", "Shoulders soft, arms by your sides", "Breathe calmly through your nose"] },
    benefit: { lt: "Gerina laikyseną ir ramina.", en: "Improves posture and calms you." },
    caution: { lt: "Nespausk kelių iki galo.", en: "Do not lock your knees." },
    kf: [k({ lsr: 0.15, rsr: -0.15 })] }),
  P({ id: "urdhva_hastasana", level: 1, robot: true, lt: "Rankos aukštyn", sa: "Urdhva Hastasana", en: "Upward Salute",
    cues: { lt: ["Įkvėpk ir kelk rankas aukštyn", "Delnai žiūri vienas į kitą", "Pečius laikyk žemai"],
            en: ["Breathe in and raise your arms", "Palms face each other", "Keep your shoulders low"] },
    benefit: { lt: "Ištempia šonus ir atveria krūtinę.", en: "Stretches your sides and opens the chest." },
    caution: { lt: "Jei skauda pečius, rankos tik iki pečių aukščio.", en: "If shoulders hurt, lift only to shoulder height." },
    kf: [k(UP)] }),
  P({ id: "anjali_mudra", level: 1, robot: true, lt: "Maldos rankos", sa: "Anjali Mudra", en: "Prayer Hands",
    cues: { lt: ["Sudėk delnus prie krūtinės", "Alkūnės žemyn ir į šonus", "Užsimerk ir kvėpuok"],
            en: ["Bring palms together at your chest", "Elbows down and wide", "Close your eyes and breathe"] },
    benefit: { lt: "Sutelkia dėmesį ir nuramina.", en: "Focuses attention and calms." },
    caution: { lt: "Spausk delnus švelniai.", en: "Press palms gently." },
    kf: [k(PRAY, { hp: 0.15 })] }),
  P({ id: "side_stretch", level: 1, robot: true, lt: "Šoninis tempimas", sa: "Parsva Urdhva Hastasana", en: "Side Stretch",
    cues: { lt: ["Rankos aukštyn", "Lenkis į vieną šoną, paskui į kitą", "Abi pėdos stipriai ant žemės"],
            en: ["Arms up", "Lean to one side, then the other", "Both feet firm on the floor"] },
    benefit: { lt: "Ištempia šonus ir kvėpavimo raumenis.", en: "Stretches the sides and breathing muscles." },
    caution: { lt: "Lenkis tik tiek, kiek malonu.", en: "Lean only as far as feels good." },
    kf: [k(UP, { lsr: 0.55, rsr: 0.05, wr: -0.4 }), k(UP), k(UP, { lsr: -0.05, rsr: -0.55, wr: 0.4 }), k(UP)] }),
  P({ id: "standing_twist", level: 1, robot: true, lt: "Stovint sukimas", sa: "Kati Chakrasana", en: "Standing Twist",
    cues: { lt: ["Rankos prie krūtinės", "Iškvėpdamas suk liemenį į šoną", "Klubai lieka vietoje"],
            en: ["Hands at your chest", "Breathe out and turn your waist", "Hips stay still"] },
    benefit: { lt: "Judina nugarą ir gerina virškinimą.", en: "Mobilises the spine and helps digestion." },
    caution: { lt: "Suk lėtai, be trūkčiojimų.", en: "Twist slowly, no jerks." },
    kf: [k(EAGLE, { wy: 0.6, hy: 0.4 }), k(EAGLE), k(EAGLE, { wy: -0.6, hy: -0.4 }), k(EAGLE)] }),
  P({ id: "garudasana_arms", level: 1, robot: true, lt: "Erelio rankos", sa: "Garudasana (rankos)", en: "Eagle Arms",
    cues: { lt: ["Sukryžiuok rankas priešais save", "Alkūnės pečių aukštyje", "Jausk tempimą tarp menčių"],
            en: ["Cross your arms in front of you", "Elbows at shoulder height", "Feel the stretch between your shoulder blades"] },
    benefit: { lt: "Atpalaiduoja pečius ir viršutinę nugarą.", en: "Releases shoulders and upper back." },
    caution: { lt: "Nespausk alkūnių per jėgą.", en: "Do not force the elbows." },
    kf: [k(EAGLE, { lsp: -1.65, rsp: -1.65 })] }),
  P({ id: "neck_shoulders", level: 1, robot: true, lt: "Kaklo ir pečių sukimai", sa: "Skandha Chakra", en: "Neck and Shoulder Rolls",
    cues: { lt: ["Lėtai pasuk galvą į šonus", "Kelk ir leisk pečius", "Judėk kartu su kvėpavimu"],
            en: ["Slowly turn your head side to side", "Lift and drop your shoulders", "Move with your breath"] },
    benefit: { lt: "Atpalaiduoja kaklą po sėdėjimo.", en: "Relaxes the neck after sitting." },
    caution: { lt: "Galvos neversk atgal.", en: "Do not drop your head back." },
    kf: [k({ hy: 0.5, lsr: 0.3, rsr: -0.3 }), k({ hy: -0.5, lsp: -0.35, rsp: -0.35 }), k({ hp: 0.3, lsr: 0.3, rsr: -0.3 }), k()] }),
  P({ id: "breath_arms", level: 1, robot: true, lt: "Kvėpavimas su rankomis", sa: "Pranayama", en: "Breathing with Arms",
    cues: { lt: ["Įkvėpdamas kelk rankas per šonus", "Iškvėpdamas leisk žemyn", "Judesys toks pat ilgas kaip kvėpavimas"],
            en: ["Breathe in, lift arms out to the sides", "Breathe out, lower them", "Make the move as long as the breath"] },
    benefit: { lt: "Nuramina širdį ir mintis.", en: "Calms the heart and the mind." },
    caution: { lt: "Jei svaigsta galva, kvėpuok ramiau.", en: "If you feel dizzy, breathe more gently." },
    kf: [k(T), k(UP), k(T), k()] }),

  // ---------- LEVEL 2 · standing (🖥️ legs in sim, robot shows arms) ----------
  P({ id: "utkatasana", level: 2, robot: false, lt: "Kėdė", sa: "Utkatasana", en: "Chair",
    cues: { lt: ["Sulenk kelius lyg sėstum ant kėdės", "Rankos aukštyn", "Svoris ant kulnų"],
            en: ["Bend your knees as if sitting on a chair", "Arms up", "Weight in your heels"] },
    benefit: { lt: "Stiprina kojas ir nugarą.", en: "Strengthens legs and back." },
    caution: { lt: "Keliai neina už pirštų.", en: "Knees stay behind your toes." },
    kf: [k(UP, { lhp: -0.85, lk: 1.4, lap: -0.55, rhp: -0.85, rk: 1.4, rap: -0.55, tx: -0.15 })] }),
  P({ id: "virabhadrasana2", level: 2, robot: false, lt: "Karys II", sa: "Virabhadrasana II", en: "Warrior II",
    cues: { lt: ["Plačiai pastatyk kojas", "Priekinį kelį sulenk", "Rankos į šonus, žiūrėk per priekinę ranką"],
            en: ["Step your feet wide", "Bend the front knee", "Arms out, look over the front hand"] },
    benefit: { lt: "Stiprina kojas, ugdo ištvermę.", en: "Builds leg strength and stamina." },
    caution: { lt: "Kelis virš kulno.", en: "Knee above the ankle." },
    kf: [k(T, { lhy: 0.9, lhr: 0.45, lhp: -0.8, lk: 1.0, lap: -0.2, rhr: -0.4, rar: 0.2, hy: 0.6 })] }),
  P({ id: "virabhadrasana1", level: 2, robot: false, lt: "Karys I", sa: "Virabhadrasana I", en: "Warrior I",
    cues: { lt: ["Viena koja priekyje, kita gale", "Priekinį kelį sulenk", "Rankos aukštyn, krūtinė į priekį"],
            en: ["One foot forward, one back", "Bend the front knee", "Arms up, chest forward"] },
    benefit: { lt: "Stiprina kojas ir atveria klubus.", en: "Strengthens legs and opens the hips." },
    caution: { lt: "Nugarą laikyk ilgą.", en: "Keep your back long." },
    kf: [k(UP, { lhp: -0.95, lk: 1.05, lap: -0.1, rhp: 0.5, rap: -0.4 })] }),
  P({ id: "trikonasana", level: 2, robot: false, lt: "Trikampis", sa: "Trikonasana", en: "Triangle",
    cues: { lt: ["Kojos plačiai, kojos tiesios", "Lenkis į šoną, ranka žemyn", "Kita ranka į lubas"],
            en: ["Feet wide, legs straight", "Tilt to the side, one hand down", "Other hand to the ceiling"] },
    benefit: { lt: "Ištempia kojas ir šonus.", en: "Stretches legs and sides." },
    caution: { lt: "Ranka remiasi į koją, ne į kelį.", en: "Rest the hand on the shin, not the knee." },
    kf: [k(T, { lhr: -0.25, rhr: -1.15, tz: -0.7, wr: -0.3, hy: -0.4 })] }),
  P({ id: "vrksasana", level: 2, robot: false, lt: "Medis", sa: "Vrksasana", en: "Tree",
    cues: { lt: ["Stovėk ant vienos kojos", "Kitą pėdą dėk prie blauzdos ar šlaunies", "Rankos maldoje, žvilgsnis viename taške"],
            en: ["Stand on one leg", "Place the other foot on your calf or thigh", "Hands in prayer, eyes on one spot"] },
    benefit: { lt: "Lavina pusiausvyrą ir dėmesį.", en: "Trains balance and focus." },
    caution: { lt: "Pėdos nespausk prie kelio.", en: "Never press the foot into the knee." },
    kf: [k(PRAY, { rhy: -0.9, rhr: -0.7, rhp: -0.7, rk: 2.1 }), k(PRAY_UP, { rhy: -0.9, rhr: -0.7, rhp: -0.7, rk: 2.1 })] }),
  P({ id: "gomukhasana_arms", level: 2, robot: true, lt: "Karvės veido rankos", sa: "Gomukhasana (rankos)", en: "Cow Face Arms",
    cues: { lt: ["Viena ranka aukštyn ir už galvos", "Kita ranka žemyn už nugaros", "Pirštai ieško vieni kitų"],
            en: ["One arm up and behind your head", "Other arm down behind your back", "Fingers reach for each other"] },
    benefit: { lt: "Atveria pečius ir krūtinę.", en: "Opens shoulders and chest." },
    caution: { lt: "Jei nesiekia, laikyk diržą.", en: "Use a strap if hands do not meet." },
    kf: [k({ rsp: -2.95, rsr: -0.25, re: -0.6, lsp: 0.65, lsr: 0.2, lsy: 0.9, le: -0.55, hp: 0.1 })] }),

  // ---------- LEVEL 3 · balance (🖥️ legs in sim) ----------
  P({ id: "parsvakonasana", level: 3, robot: false, lt: "Ištiestas šoninis kampas", sa: "Utthita Parsvakonasana", en: "Extended Side Angle",
    cues: { lt: ["Iš Kario II lenkis prie priekinės kojos", "Dilbis ant šlaunies", "Viršutinė ranka tęsiasi virš galvos"],
            en: ["From Warrior II lean over the front leg", "Forearm on the thigh", "Top arm reaches over your head"] },
    benefit: { lt: "Ištempia visą šoną nuo pėdos iki rankos.", en: "Stretches the whole side from foot to hand." },
    caution: { lt: "Krūtinė lieka atvira.", en: "Keep the chest open." },
    kf: [k({ lsp: -0.4, lsr: 2.3, le: 1.45, rsp: -0.3, rsr: -0.5, re: 0.6, rhy: -0.9, rhr: -1.5, rhp: -0.8, rk: 1.1, rap: -0.2, lhr: -0.4, tz: -0.9, wr: -0.3, hy: 0.4 })] }),
  P({ id: "ardha_chandrasana", level: 3, robot: false, lt: "Pusmėnulis", sa: "Ardha Chandrasana", en: "Half Moon",
    cues: { lt: ["Ranka į grindis po petimi", "Kelk užpakalinę koją lygiagrečiai grindims", "Viršutinė ranka į lubas"],
            en: ["Hand to the floor under the shoulder", "Lift the back leg parallel to the floor", "Top hand to the ceiling"] },
    benefit: { lt: "Stiprina pusiausvyrą ir šonus.", en: "Builds balance and side strength." },
    caution: { lt: "Naudok kaladėlę po ranka.", en: "Use a block under the hand." },
    kf: [k(T, { lhr: 0.1, rhr: -1.4, tz: -1.4, wr: -0.3 })] }),
  P({ id: "parivrtta_trikonasana", level: 3, robot: false, lt: "Susuktas trikampis", sa: "Parivrtta Trikonasana", en: "Revolved Triangle",
    cues: { lt: ["Kojos tiesios, klubai į priekį", "Lenkis pirmyn ir suk krūtinę", "Viena ranka žemyn, kita aukštyn"],
            en: ["Legs straight, hips square", "Fold forward and turn the chest", "One hand down, one hand up"] },
    benefit: { lt: "Sukimas stiprina nugarą ir pusiausvyrą.", en: "The twist strengthens back and balance." },
    caution: { lt: "Nugarą pirmiausia ištiesk, tik tada suk.", en: "Lengthen the spine first, then twist." },
    kf: [k(T, { lhp: -1.3, rhp: -0.7, tx: -1.0, wy: 1.1, hy: 0.5 })] }),
  P({ id: "garudasana", level: 3, robot: false, lt: "Erelis", sa: "Garudasana", en: "Eagle",
    cues: { lt: ["Sulenk kelius", "Apvyniok vieną koją aplink kitą", "Rankos erelio padėtyje"],
            en: ["Bend your knees", "Wrap one leg around the other", "Arms in eagle position"] },
    benefit: { lt: "Stiprina kulkšnis ir pusiausvyrą.", en: "Strengthens ankles and balance." },
    caution: { lt: "Pirštai gali liesti grindis.", en: "Toes may stay on the floor." },
    kf: [k(EAGLE, { lsp: -1.65, rsp: -1.65, lhp: -0.6, lk: 0.9, lap: -0.35, rhp: -0.85, rhr: 0.55, rk: 1.1, tx: -0.15 })] }),
  P({ id: "virabhadrasana3", level: 3, robot: false, lt: "Karys III", sa: "Virabhadrasana III", en: "Warrior III",
    cues: { lt: ["Stovėk ant vienos kojos", "Lenkis pirmyn, kita koja atgal", "Kūnas kaip raidė T"],
            en: ["Stand on one leg", "Tip forward, lift the other leg back", "Body like the letter T"] },
    benefit: { lt: "Stiprina visą užpakalinę kūno pusę.", en: "Strengthens the whole back of the body." },
    caution: { lt: "Rankas gali laikyti ant klubų.", en: "You may keep hands on your hips." },
    kf: [k(UP, { lhp: -1.35, tx: -1.4, lap: 0.05 })] }),
  P({ id: "natarajasana", level: 3, robot: false, lt: "Šokėjas", sa: "Natarajasana", en: "Dancer",
    cues: { lt: ["Suimk pėdą už nugaros", "Spausk pėdą į delną", "Kita ranka į priekį ir aukštyn"],
            en: ["Hold your foot behind you", "Press the foot into your hand", "Other arm forward and up"] },
    benefit: { lt: "Atveria krūtinę ir lavina pusiausvyrą.", en: "Opens the chest and trains balance." },
    caution: { lt: "Nelenk juosmens per stipriai.", en: "Do not over-arch the low back." },
    kf: [k({ lsp: -2.5, lsr: 0.1, le: 1.45, rsp: 1.0, rsr: -0.15, re: 1.35, lhp: -0.45, rhp: 0.45, rk: 1.9, tx: -0.45 })] }),

  // ---------- LEVELS 4 to 6 · 🖥️ simulation only, locked for the robot ----------
  P({ id: "bakasana", level: 4, robot: false, locked: true, lt: "Varna", sa: "Bakasana", en: "Crow",
    cues: { lt: ["Delnai ant grindų", "Keliai ant žastų", "Lėtai perkelk svorį į rankas"],
            en: ["Palms on the floor", "Knees on your upper arms", "Slowly shift weight into the hands"] },
    benefit: { lt: "Stiprina rankas ir pilvo raumenis.", en: "Builds arm and core strength." },
    caution: { lt: "Pagalvė priešais veidą.", en: "Put a cushion in front of your face." },
    kf: [k({ lsp: -1.0, lsr: 0.25, le: 1.0, rsp: -1.0, rsr: -0.25, re: 1.0, lhp: -2.2, lhr: 0.3, lk: 2.3, lap: 0.3, rhp: -2.2, rhr: -0.3, rk: 2.3, rap: 0.3, tx: -1.1 })] }),
  P({ id: "padmasana", level: 4, robot: false, locked: true, lt: "Lotosas", sa: "Padmasana", en: "Lotus",
    cues: { lt: ["Sėsk sukryžiavęs kojas", "Pėdos ant priešingų šlaunų", "Nugara tiesi, rankos ant kelių"],
            en: ["Sit cross-legged", "Feet on the opposite thighs", "Spine tall, hands on knees"] },
    benefit: { lt: "Ramina ir tinka meditacijai.", en: "Calming, good for meditation." },
    caution: { lt: "Saugok kelius, rinkis pusę lotoso.", en: "Protect your knees, try half lotus." },
    kf: [k({ lsp: -0.7, lsr: 0.3, le: 1.0, rsp: -0.7, rsr: -0.3, re: 1.0, lhp: -1.5, lhr: 0.6, lhy: 0.9, lk: 2.4, rhp: -1.5, rhr: -0.6, rhy: -0.9, rk: 2.4 })] }),
  P({ id: "sirsasana", level: 5, robot: false, locked: true, lt: "Stovėjimas ant galvos", sa: "Sirsasana", en: "Headstand",
    cues: { lt: ["Dilbiai ant grindų, pirštai supinti", "Galvos viršus ant grindų", "Kojas kelk lėtai ir kartu"],
            en: ["Forearms down, fingers laced", "Crown of the head on the floor", "Lift both legs slowly together"] },
    benefit: { lt: "Stiprina pečius ir pilvą.", en: "Strengthens shoulders and core." },
    caution: { lt: "Tik su mokytoju ir prie sienos.", en: "Only with a teacher, near a wall." },
    kf: [k({ lsp: -2.7, lsr: 0.3, le: 0.0, rsp: -2.7, rsr: -0.3, re: 0.0, tx: 3.1 })] }),
  P({ id: "adho_mukha_vrksasana", level: 5, robot: false, locked: true, lt: "Stovėjimas ant rankų", sa: "Adho Mukha Vrksasana", en: "Handstand",
    cues: { lt: ["Delnai pečių plotyje", "Spirkis ir kelk kojas prie sienos", "Žiūrėk tarp delnų"],
            en: ["Hands shoulder width", "Kick up to the wall", "Look between your hands"] },
    benefit: { lt: "Stiprina rankas ir pasitikėjimą.", en: "Builds arm strength and confidence." },
    caution: { lt: "Tik su pagalbininku.", en: "Only with a spotter." },
    kf: [k({ lsp: -3.05, lsr: 0.2, le: 1.45, rsp: -3.05, rsr: -0.2, re: 1.45, tx: 3.1 })] }),
  P({ id: "urdhva_dhanurasana", level: 6, robot: false, locked: true, lt: "Ratas", sa: "Urdhva Dhanurasana", en: "Wheel",
    cues: { lt: ["Gulėk ant nugaros, delnai prie ausų", "Spausk delnus ir pėdas", "Kelk klubus ir krūtinę"],
            en: ["Lie on your back, hands by your ears", "Press hands and feet", "Lift hips and chest"] },
    benefit: { lt: "Gilus krūtinės ir pečių atvėrimas.", en: "Deep chest and shoulder opener." },
    caution: { lt: "Tik apšilus ir su mokytoju.", en: "Only warmed up and with a teacher." },
    kf: [k({ lsp: -2.9, lsr: 0.2, le: 1.4, rsp: -2.9, rsr: -0.2, re: 1.4, lhp: 1.3, lk: 1.6, lap: -0.4, rhp: 1.3, rk: 1.6, rap: -0.4, tx: 1.75 })] }),
  P({ id: "kapotasana", level: 6, robot: false, locked: true, lt: "Karališkas balandis", sa: "Kapotasana", en: "King Pigeon",
    cues: { lt: ["Klūpėk, keliai klubų plotyje", "Lenkis atgal, krūtinė į lubas", "Rankos siekia pėdų"],
            en: ["Kneel, knees hip width", "Arch back, chest to the ceiling", "Hands reach for the feet"] },
    benefit: { lt: "Atveria klubų priekį ir krūtinę.", en: "Opens hip flexors and chest." },
    caution: { lt: "Pažengusiems. Saugok juosmenį.", en: "Advanced. Protect your low back." },
    kf: [k({ lsp: -3.0, lsr: 0.2, le: 1.4, rsp: -3.0, rsr: -0.2, re: 1.4, lhp: 1.1, lk: 2.35, rhp: 1.1, rk: 2.35, tx: 1.1 })] }),
];

export const REST_POSE = REST;
export const byLevel = (n) => ASANAS.filter((a) => a.level === n);

// Spoken text (LT + EN). Same rule feeds tools/make_voice.py via data/speech.json.
export const PHRASES = {
  welcome: { lt: "Labas. Aš R1, tavo jogos instruktorius. Pradedam.", en: "Hello. I am R1, your yoga instructor. Let us begin." },
  inhale: { lt: "Įkvėpk", en: "Breathe in" },
  exhale: { lt: "Iškvėpk", en: "Breathe out" },
  pause: { lt: "Pauzė. Pasakyk tęsk, kai būsi pasiruošęs.", en: "Pause. Say continue when you are ready." },
  resume: { lt: "Tęsiam.", en: "Let us continue." },
  stop: { lt: "Sustojam. Grįžtu į saugią padėtį.", en: "Stopping. Returning to a safe position." },
  checkin_continue: { lt: "Ar galime tęsti?", en: "Can we continue?" },
  checkin_clear: { lt: "Ar viskas aišku?", en: "Is everything clear?" },
  again_slow: { lt: "Gerai, paaiškinsiu dar kartą, lėčiau.", en: "Okay, I will explain again, more slowly." },
  slower: { lt: "Lėčiau.", en: "Slower." },
  faster: { lt: "Greičiau.", en: "Faster." },
  done: { lt: "Puiku. Pamoka baigta. Ačiū, kad sportavai kartu.", en: "Great. The class is done. Thank you for practising with me." },
  locked: { lt: "Šis lygis rodomas tik ekrane. Apsivertimai ir grindys robotui nesaugu.", en: "This level is shown on screen only. Inversions and floor work are not safe for the robot." },
};

export function introText(a, lang) {
  return `${lang === "lt" ? a.lt : a.en}. ${a.sa}. ${a.cues[lang].join(". ")}.`;
}
export function explainText(a, lang) {
  return `${lang === "lt" ? a.lt : a.en}. ${a.benefit[lang]} ${a.cues[lang].join(". ")}. ${lang === "lt" ? "Atsargiai" : "Careful"}: ${a.caution[lang]}`;
}
export function speechTable() {
  const out = {};
  for (const [id, t] of Object.entries(PHRASES)) out[id] = t;
  for (const a of ASANAS) {
    out[`${a.id}_intro`] = { lt: introText(a, "lt"), en: introText(a, "en") };
    out[`${a.id}_explain`] = { lt: explainText(a, "lt"), en: explainText(a, "en") };
  }
  return out;
}
