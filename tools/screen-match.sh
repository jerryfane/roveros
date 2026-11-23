#!/bin/bash
# Used by tools/boot-test.sh inside its container. Prints "yes" when the
# display frame qemu showed (DISPLAY_PPM) is pixel-identical to cage's own
# capture, which the self-check printed on the serial console as one
# ROVER-GRIM-BEGIN ... ROVER-GRIM-END block; "no" otherwise. Saves the decoded
# capture as OUT_PNG when there is one.
#
# Usage: screen-match.sh SERIAL_LOG DISPLAY_PPM OUT_PNG
set -euo pipefail
serial=$1 display=$2 png=$3
work=$(mktemp -d)
trap 'rm -rf -- "$work"' EXIT

# Only whole self-check records count: a line must start with the console's
# timestamp and the self-check's name, so quoted copies elsewhere do not. The
# capture must be exactly one block, BEGIN, payload, END, in that order, with
# BEGIN and END from the same self-check process; anything else is "no". The
# payload lines carry the PID of the self-check's encoder child, not its own.
[ -s "$display" ] || { echo no; exit 0; }
tr -d '\r' <"$serial" | awk -v out="$work/b64" '
  match($0, /^\[ *[0-9.]+\] selfcheck\[[0-9]+\]: ROVER-GRIM/) {
    pid = $0; sub(/^.*selfcheck\[/, "", pid); sub(/\].*$/, "", pid)
    rest = $0; sub(/^.*selfcheck\[[0-9]+\]: /, "", rest)
    if (rest == "ROVER-GRIM-BEGIN") {
      if (state != "") bad = 1
      state = "in"; owner = pid; blocks++; next
    }
    if (rest == "ROVER-GRIM-END") {
      if (state != "in" || pid != owner || lines == 0) bad = 1
      state = "done"; next
    }
    if (rest ~ /^ROVER-GRIM [A-Za-z0-9+\/=]+$/) {
      if (state != "in") bad = 1
      sub(/^ROVER-GRIM /, "", rest); print rest > out; lines++; next
    }
  }
  END { exit (bad || blocks != 1 || state != "done") ? 1 : 0 }
' || { echo no; exit 0; }
base64 -d <"$work/b64" >"$work/grim.png" 2>/dev/null || { echo no; exit 0; }
cp "$work/grim.png" "$png"
if pngtopnm "$work/grim.png" 2>/dev/null | ppmtoppm >"$work/grim.ppm" &&
  ppmtoppm <"$display" >"$work/display.ppm" &&
  cmp -s "$work/grim.ppm" "$work/display.ppm"; then
  echo yes
else
  echo no
fi
