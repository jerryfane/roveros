#!/bin/bash
# Boots a RoverOS image headless in a throwaway container and checks it:
# the self-check line on the serial console must report a read-only root, the
# data partition, HerdrUp running and every service active. Saves the Rover's
# screen 20 s, 90 s and 3 min after HerdrUp starts, side by side, as
# OUTDIR/screen.png; the 3 min one must not look blank.
#
# Usage: tools/boot-test.sh [OUTDIR]     (default: out/)
# Needs Docker. Writes to the disk are discarded (qemu -snapshot).
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
out=$(realpath -m "${1:-$repo/out}")
timeout_s=${ROVER_BOOT_TIMEOUT:-900}

docker run --rm \
  -v "$repo/tools:/tools:ro" -v "$out:/out" \
  -e ROVER_BOOT_TIMEOUT="$timeout_s" \
  debian:trixie bash -c '
set -euo pipefail
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
  qemu-system-arm qemu-utils socat netpbm >/dev/null
rm -f /out/serial.log /out/screen.png
ROVER_DISPLAY=none ROVER_SNAPSHOT=1 /tools/run-vm.sh /out >/out/serial.log 2>&1 &
vm=$!
end=$(( $(date +%s) + ROVER_BOOT_TIMEOUT ))
until grep -q "ROVER-SELFCHECK-END" /out/serial.log; do
  if ! kill -0 $vm 2>/dev/null || [ "$(date +%s)" -ge $end ] ||
     grep -q "emergency mode" /out/serial.log; then
    echo "boot-test: no self-check line; serial log in /out/serial.log" >&2
    kill $vm 2>/dev/null || true
    exit 1
  fi
  sleep 5
done
shot() { # NAME: screendump to /out/NAME.ppm
  echo "screendump /out/$1.ppm" | socat - UNIX-CONNECT:/out/monitor.sock >/dev/null
  sleep 2
}
shot s20
sleep 68
shot s90
until grep -q "ROVER-SELFCHECK-LATE" /out/serial.log; do
  [ "$(date +%s)" -lt $end ] || { echo "boot-test: no late self-check" >&2; break; }
  sleep 5
done
shot s180
# A drawn HerdrUp screen has hundreds of colours; a blank or plain screen has
# few (blank preview.17 under cage: 79; preview.15: 804).
ppmhist -noheader /out/s180.ppm | wc -l >/out/screen.colours
pnmcat -lr /out/s20.ppm /out/s90.ppm /out/s180.ppm | pnmtopng >/out/screen.png
rm -f /out/s20.ppm /out/s90.ppm /out/s180.ppm
echo quit | socat - UNIX-CONNECT:/out/monitor.sock >/dev/null || true
wait $vm || true
chown '"$(id -u):$(id -g)"' /out/serial.log /out/screen.png /out/screen.colours
'

line=$(grep -a -o 'ROVER-SELFCHECK root_ro.*' "$out/serial.log" | tr -d '\r' | tail -1)
echo "$line"
expected="root_ro=yes data=yes machine_id=yes herdrup=yes kiosk=active ssh=active tailscaled=active nftables=active network=active"
for kv in $expected; do
  case " $line " in
    *" $kv "*) ;;
    *) echo "boot-test: FAIL: expected $kv" >&2; exit 1 ;;
  esac
done
colours=$(cat "$out/screen.colours")
if [ "$colours" -lt 150 ]; then
  echo "boot-test: FAIL: the screen looks blank ($colours colours); HerdrUp log:" >&2
  grep -a 'ROVER-KIOSK' "$out/serial.log" | tr -d '\r' >&2
  exit 1
fi
echo "boot-test: PASS (screenshot: $out/screen.png)"
