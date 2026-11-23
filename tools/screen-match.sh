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
# timestamp and the self-check's name, so quoted copies elsewhere do not.
rec='^\[ *[0-9.]+\] selfcheck\[[0-9]+\]: '
tr -d '\r' <"$serial" >"$work/log"
begins=$(grep -cE "${rec}ROVER-GRIM-BEGIN\$" "$work/log" || true)
ends=$(grep -cE "${rec}ROVER-GRIM-END\$" "$work/log" || true)
if [ "$begins" != 1 ] || [ "$ends" != 1 ] || [ ! -s "$display" ]; then
  echo no
  exit 0
fi
sed -nE "/${rec}ROVER-GRIM-BEGIN\$/,/${rec}ROVER-GRIM-END\$/ s/${rec}ROVER-GRIM ([A-Za-z0-9+\/=]+)\$/\\1/p" \
  "$work/log" | base64 -d >"$work/grim.png" 2>/dev/null || { echo no; exit 0; }
cp "$work/grim.png" "$png"
if pngtopnm "$work/grim.png" 2>/dev/null | ppmtoppm >"$work/grim.ppm" &&
  ppmtoppm <"$display" >"$work/display.ppm" &&
  cmp -s "$work/grim.ppm" "$work/display.ppm"; then
  echo yes
else
  echo no
fi
