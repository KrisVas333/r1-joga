#!/usr/bin/env python3
"""Check every r1ctl export with r1ctl's OWN validator, the same code `r1ctl install` runs.

    python tools/check_exports.py ../r1-studio/r1ctl            # Windows / Mac clone layout
    python3 tools/check_exports.py ~/r1/r1ctl                   # Mac kit layout

What it does, per file in export/ and export/poses/:
  1. r1ctl.install() into a TEMPORARY library (never touches the real one): kind detection,
     validate_file() for YAML, check_csv() for CSV (14 columns, |q| <= 3.2 rad, >= 2 rows).
  2. each pose dance's arm_traj file resolves in that library (find_item).
  3. extra yoga checks: 50 Hz rows, peak joint speed <= 1.0 rad/s, starts and ends at rest (pose moves).
Prints one line per file and a pass count. Exit 1 on any failure.
"""
import glob
import os
import shutil
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAP = 1.0  # rad/s, same as js/joints.js CAP.arm


def main():
    if os.name == "nt" and not sys.flags.utf8_mode:  # r1ctl opens files with the locale codec; Linux/Mac = UTF-8
        import subprocess
        sys.exit(subprocess.call([sys.executable, "-X", "utf8"] + sys.argv))
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    r1ctl_dir = os.path.abspath(os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "..", "r1-studio", "r1ctl")))
    sys.path.insert(0, r1ctl_dir)
    import r1ctl

    tmp = tempfile.mkdtemp(prefix="r1joga-check-")
    r1ctl.LIB = tmp  # install into a throwaway library
    for k in r1ctl.KINDS:
        os.makedirs(os.path.join(tmp, k), exist_ok=True)
    files = sorted(glob.glob(os.path.join(ROOT, "export", "*.yaml")) + glob.glob(os.path.join(ROOT, "export", "*.csv"))
                   + glob.glob(os.path.join(ROOT, "export", "poses", "*.yaml")) + glob.glob(os.path.join(ROOT, "export", "poses", "*.csv")))
    ok = bad = 0
    try:
        # CSVs first so the dances' arm_traj files resolve
        for p in sorted(files, key=lambda f: not f.endswith(".csv")):
            rel = os.path.relpath(p, ROOT).replace("\\", "/")
            try:
                r1ctl.install(p)
                extra = ""
                if p.endswith(".csv"):
                    extra = check_motion(p, pose="poses" in rel)
                else:
                    data = r1ctl.load_yaml(p)
                    for step in walk(data["steps"]):
                        if "arm_traj" in step:
                            a = step["arm_traj"]
                            r1ctl.find_item("arm", a["file"] if isinstance(a, dict) else a)
                print("✅", rel, extra)
                ok += 1
            except Exception as e:  # noqa: BLE001
                print("❌", rel, "→", e)
                bad += 1
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print("\n%d / %d pass (r1ctl validator: %s)" % (ok, ok + bad, os.path.join(r1ctl_dir, "r1ctl.py")))
    sys.exit(1 if bad else 0)


def walk(steps):
    for s in steps:
        yield s
        k, v = next(iter(s.items()))
        if k in ("parallel", "random"):
            yield from walk(v)
        if k == "repeat":
            yield from walk(v["steps"])


def check_motion(path, pose):
    rows = []
    for line in open(path):
        try:
            rows.append([float(c) for c in line.strip().split(",")])
        except ValueError:
            continue
    dts = {round(b[0] - a[0], 3) for a, b in zip(rows, rows[1:])}
    if dts != {0.02}:
        raise ValueError("not 50 Hz: dt %s" % sorted(dts))
    peak = max(abs(b[j] - a[j]) / 0.02 for a, b in zip(rows, rows[1:]) for j in range(1, 14))
    if peak > CAP:
        raise ValueError("peak joint speed %.2f rad/s > %.1f" % (peak, CAP))
    if pose and max(abs(x - y) for x, y in zip(rows[0][1:], rows[-1][1:])) > 1e-3:
        raise ValueError("pose move must end where it starts (rest)")
    return "· %d rows · %.1f s · peak %.2f rad/s" % (len(rows), rows[-1][0], peak)


if __name__ == "__main__":
    main()
