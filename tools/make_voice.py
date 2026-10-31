#!/usr/bin/env python3
"""Generate audio/<lang>/<id>.mp3 for every spoken line in data/speech.json with Kris's ElevenLabs voice.

    python3 tools/make_voice.py --test       # ONE Lithuanian sentence → audio/test_lt.mp3, plays it, says which model worked
    python3 tools/make_voice.py              # Kris voice, all lines, lt + en → audio/kris/<lang>/, audio/manifest.json
    python3 tools/make_voice.py --voice female   # AIstė A2 (female, LT, from Kris's ElevenLabs account)
    python3 tools/make_voice.py --voice robot    # Kris's clips + ffmpeg robot filter (no API credits; run kris first)
    python3 tools/make_voice.py --voice all      # kris → female → robot
    python3 tools/make_voice.py --lang lt --only tadasana_intro,welcome --dry-run
    node tools/build.mjs                     # (only if js/asanas.js changed) refresh data/speech.json first

Key, first one found wins (the key is NEVER printed or written anywhere):
  1. env ELEVENLABS_API_KEY
  2. ~/.config/elevenlabs/key                (same file r1ctl / R1 Studio read)
  3. `eleven_key_file:` in ~/r1/r1ctl/config.yaml (optional pointer to another file)
Model: eleven_v4_turbo first; if it rejects Lithuanian, eleven_multilingual_v2 (the model that worked is printed
and stored in audio/manifest.json → "models").
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICES = {  # name → ElevenLabs voice id; "robot" is derived from "kris" locally
    "kris": "4IODp0ntCcYJIRzjBGVV",    # Kris Pro voice (same as r1ctl/config.yaml eleven_voice)
    "female": "If6gt8kmFRfS5SzLE1Lx",  # AIstė A2 — šilta, rami, aiški (LT, Voice Design v3)
    "yogi": "9SQbmrWJKb2D7IcSsgFh",    # Jogas — original elderly Indian yoga teacher (Voice Design, 2026-10-31)
}
VOICE = VOICES["kris"]
# ring-mod + flanger + slight pitch drop: still Kris's words and timing, clearly a robot
ROBOT_FILTER = ("asetrate=44100*0.94,aresample=44100,atempo=1.0638,"
                "afftfilt=real='hypot(re,im)*cos(0)':imag='hypot(re,im)*sin(0)':win_size=512:overlap=0.75,"
                "flanger=delay=2:depth=2:speed=0.5,aecho=0.8:0.6:12:0.35,"
                "highpass=f=120,lowpass=f=7000,volume=1.4")
MODEL = "eleven_v4_turbo"        # same as r1ctl/config.yaml eleven_model
FALLBACK_MODEL = "eleven_multilingual_v2"
TEST_LT = "Labas. Aš R1, tavo jogos instruktorius. Įkvėpk ir kelk rankas aukštyn."
R1CTL_CONFIG = Path.home() / "r1" / "r1ctl" / "config.yaml"


def api_key():
    k = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if k:
        return k, "env ELEVENLABS_API_KEY"
    p = Path.home() / ".config" / "elevenlabs" / "key"
    if p.exists() and p.read_text().strip():
        return p.read_text().strip(), "~/.config/elevenlabs/key"
    if R1CTL_CONFIG.exists():  # tiny line parser: no PyYAML needed on the Mac
        for line in R1CTL_CONFIG.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("eleven_key_file:"):
                f = Path(os.path.expanduser(line.split(":", 1)[1].split("#")[0].strip().strip("'\"")))
                if f.exists() and f.read_text().strip():
                    return f.read_text().strip(), "eleven_key_file in %s" % R1CTL_CONFIG
    sys.exit("❌ No ElevenLabs key. Copy it from elevenlabs.io (Profile → API keys), then:\n"
             "   mkdir -p ~/.config/elevenlabs && pbpaste > ~/.config/elevenlabs/key && chmod 600 ~/.config/elevenlabs/key\n"
             "   (or: export ELEVENLABS_API_KEY=...)")


def _post(key, text, model, lang, voice=VOICE):
    body = {"text": text, "model_id": model, "voice_settings": {"stability": 0.6, "similarity_boost": 0.8}}
    if lang:
        body["language_code"] = lang
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def tts(key, text, model, lang, quiet=False, voice=VOICE):
    """Try model + language_code, model alone, then the fallback model the same way. Returns (mp3 bytes, model used)."""
    tries = [(model, lang), (model, None)]
    if model != FALLBACK_MODEL:
        tries += [(FALLBACK_MODEL, lang), (FALLBACK_MODEL, None)]
    last = None
    for m, l in tries:
        try:
            return _post(key, text, m, l, voice), m
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                sys.exit("❌ ElevenLabs said %d: key wrong or no TTS permission (key not shown)." % e.code)
            if e.code == 429:
                time.sleep(5)
            msg = e.read()[:200].decode("utf-8", "replace")
            last = "%s%s → HTTP %d %s" % (m, " +language_code" if l else "", e.code, msg)
            if not quiet:
                print("   ↪", last)
    sys.exit("❌ every model failed. Last: %s" % last)


def play(path):
    for cmd in (["afplay", str(path)], ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", str(path)], ["mpg123", "-q", str(path)]):
        if shutil.which(cmd[0]):
            subprocess.run(cmd)
            return cmd[0]
    return None


def test(key, model):
    out = ROOT / "audio" / "test_lt.mp3"
    out.parent.mkdir(parents=True, exist_ok=True)
    print("🎙️  rendering 1 Lithuanian sentence:", TEST_LT)
    data, used = tts(key, TEST_LT, model, "lt")
    out.write_bytes(data)
    print("✅ model that worked: %s · %d KB → %s" % (used, len(data) // 1024, out.relative_to(ROOT).as_posix()))
    player = play(out)
    print("🔊 played with %s" % player if player else "🔊 no player found: open audio/test_lt.mp3 yourself")
    print("Sounds like Kris in Lithuanian? Then run the full set:  python3 tools/make_voice.py%s"
          % ("" if used == MODEL else " --model " + used))


def robotize(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", ROBOT_FILTER,
                    "-codec:a", "libmp3lame", "-b:a", "128k", str(dst)], check=True)


def write_manifest():
    mf = ROOT / "audio" / "manifest.json"
    old = json.loads(mf.read_text(encoding="utf-8")) if mf.exists() else {}
    m = {"voices": {}, "models": old.get("models", {})}
    for v in ("kris", "female", "robot", "yogi"):
        m["voices"][v] = {l: sorted(p.stem for p in (ROOT / "audio" / v / l).glob("*.mp3")) for l in ("lt", "en")}
    mf.write_text(json.dumps(m, indent=1), encoding="utf-8")
    return m


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--test", action="store_true", help="render one LT sentence, play it, print the model that worked")
    ap.add_argument("--voice", choices=["kris", "female", "robot", "yogi", "all"], default="kris")
    ap.add_argument("--lang", choices=["lt", "en", "all"], default="all")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--only", default="", help="comma-separated ids")
    ap.add_argument("--force", action="store_true", help="re-generate existing files")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    names = ["kris", "female", "robot", "yogi"] if a.voice == "all" else [a.voice]
    key = None
    if not a.dry_run and (a.test or any(n in VOICES for n in names)):
        key, where = api_key()
        print("🔑 key found in %s (not shown)" % where)
    if a.test:
        if a.voice in ("female", "yogi"):
            global VOICE
            VOICE = VOICES[a.voice]
        if a.voice == "robot":
            src = ROOT / "audio" / "test_lt.mp3"
            if not src.exists():
                test(key, a.model)
            dst = ROOT / "audio" / "test_lt_robot.mp3"
            robotize(src, dst)
            print("🤖 robot test →", dst.relative_to(ROOT).as_posix()); play(dst); return
        return test(key, a.model)
    table = json.loads((ROOT / "data" / "speech.json").read_text(encoding="utf-8"))
    only = {x for x in a.only.split(",") if x}
    langs = ["lt", "en"] if a.lang == "all" else [a.lang]
    mf = ROOT / "audio" / "manifest.json"
    models = json.loads(mf.read_text(encoding="utf-8")).get("models", {}) if mf.exists() else {}
    if "lt" in models or "en" in models:  # old flat format
        models = {}
    chars = made = 0
    for name in names:
        for lang in langs:
            out = ROOT / "audio" / name / lang
            out.mkdir(parents=True, exist_ok=True)
            for id_, t in table.items():
                if only and id_ not in only:
                    continue
                f = out / f"{id_}.mp3"
                if f.exists() and not a.force:
                    continue
                if name == "robot":
                    src = ROOT / "audio" / "kris" / lang / f"{id_}.mp3"
                    if not src.exists():
                        print("skip robot", lang, id_, "(no kris clip yet)"); continue
                    if a.dry_run:
                        print(f"[dry] robot/{lang}/{id_}"); continue
                    robotize(src, f); made += 1; continue
                chars += len(t[lang])
                if a.dry_run:
                    print(f"[dry] {name}/{lang}/{id_}: {t[lang][:70]}")
                    continue
                data, used = tts(key, t[lang], a.model, lang, voice=VOICES[name])
                f.write_bytes(data)
                models.setdefault(name, {}).setdefault(lang, {})
                models[name][lang][used] = models[name][lang].get(used, 0) + 1
                made += 1
                print("ok", f.relative_to(ROOT).as_posix(), "·", used)
                time.sleep(0.3)
    if not a.dry_run:
        old = json.loads(mf.read_text(encoding="utf-8")) if mf.exists() else {}
        mf.write_text(json.dumps({**old, "models": models}, indent=1), encoding="utf-8")
        m = write_manifest()
        counts = {v: {l: len(x) for l, x in d.items()} for v, d in m["voices"].items()}
    else:
        counts = "dry"
    print(f"made {made} · characters {chars} · voices {counts}")
    if made:
        print("Next: git add audio && git commit -m 'voices' && git push")


if __name__ == "__main__":
    main()
