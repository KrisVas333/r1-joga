#!/usr/bin/env python3
"""Generate audio/<lang>/<id>.mp3 for every spoken line in data/speech.json with Kris's ElevenLabs voice.

    node tools/build.mjs            # refresh data/speech.json from js/asanas.js
    python tools/make_voice.py      # all lines, lt + en
    python tools/make_voice.py --lang lt --only tadasana_intro,welcome --dry-run

Key: env ELEVENLABS_API_KEY or ~/.config/elevenlabs/key (never commit it).
Model: eleven_v4_turbo  ⚠️ Lithuanian on v4 turbo is UNTESTED; if LT sounds wrong, use --model eleven_multilingual_v2.
Writes audio/manifest.json so the web page only requests files that exist (no 404s).
"""
import argparse, json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE = "4IODp0ntCcYJIRzjBGVV"   # Kris Pro voice (same as r1ctl/config.yaml)
MODEL = "eleven_v4_turbo"
FALLBACK_MODEL = "eleven_multilingual_v2"


def api_key():
    k = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not k:
        p = Path.home() / ".config" / "elevenlabs" / "key"
        if p.exists():
            k = p.read_text().strip()
    if not k:
        sys.exit("No key: set ELEVENLABS_API_KEY or write ~/.config/elevenlabs/key")
    return k


def tts(key, text, model, lang):
    body = {"text": text, "model_id": model, "voice_settings": {"stability": 0.6, "similarity_boost": 0.8}}
    if lang:
        body["language_code"] = lang
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", choices=["lt", "en", "all"], default="all")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--only", default="", help="comma-separated ids")
    ap.add_argument("--force", action="store_true", help="re-generate existing files")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    table = json.loads((ROOT / "data" / "speech.json").read_text(encoding="utf-8"))
    only = {x for x in a.only.split(",") if x}
    langs = ["lt", "en"] if a.lang == "all" else [a.lang]
    key = None if a.dry_run else api_key()
    chars = 0
    for lang in langs:
        out = ROOT / "audio" / lang
        out.mkdir(parents=True, exist_ok=True)
        for id_, t in table.items():
            if only and id_ not in only:
                continue
            f = out / f"{id_}.mp3"
            if f.exists() and not a.force:
                continue
            chars += len(t[lang])
            if a.dry_run:
                print(f"[dry] {lang}/{id_}: {t[lang][:70]}")
                continue
            try:
                f.write_bytes(tts(key, t[lang], a.model, lang))
            except urllib.error.HTTPError as e:
                if a.model != FALLBACK_MODEL:
                    print(f"{lang}/{id_}: {e.code} on {a.model}, retrying {FALLBACK_MODEL}")
                    f.write_bytes(tts(key, t[lang], FALLBACK_MODEL, lang))
                else:
                    raise
            print("ok", f.relative_to(ROOT))
            time.sleep(0.3)
    manifest = {l: sorted(p.stem for p in (ROOT / "audio" / l).glob("*.mp3")) for l in ("lt", "en")}
    (ROOT / "audio" / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print(f"characters: {chars} · manifest: lt {len(manifest['lt'])}, en {len(manifest['en'])}")


if __name__ == "__main__":
    main()
