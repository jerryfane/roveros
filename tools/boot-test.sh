#!/bin/bash
# Boots a RoverOS image headless in a throwaway container and checks it:
# the self-check line on the serial console must report a read-only root, the
# data partition, HerdrUp running and every service active. Saves a screenshot
# of the Rover's screen as OUTDIR/screen.png.
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
until grep -q "ROVER-SELFCHECK" /out/serial.log; do
  if ! kill -0 $vm 2>/dev/null || [ "$(date +%s)" -ge $end ]; then
    echo "boot-test: no self-check line; serial log in /out/serial.log" >&2
    kill $vm 2>/dev/null || true
    exit 1
  fi
  sleep 5
done
sleep 20 # let HerdrUp draw its first screen
echo "screendump /out/screen.ppm" | socat - UNIX-CONNECT:/out/monitor.sock >/dev/null
sleep 2
pnmtopng /out/screen.ppm >/out/screen.png && rm -f /out/screen.ppm
echo quit | socat - UNIX-CONNECT:/out/monitor.sock >/dev/null || true
wait $vm || true
chown '"$(id -u):$(id -g)"' /out/serial.log /out/screen.png
'

line=$(grep -a -o 'ROVER-SELFCHECK.*' "$out/serial.log" | tr -d '\r' | tail -1)
echo "$line"
expected="root_ro=yes data=yes herdrup=yes kiosk=active ssh=active tailscaled=active nftables=active network=active"
for kv in $expected; do
  case " $line " in
    *" $kv "*) ;;
    *) echo "boot-test: FAIL: expected $kv" >&2; exit 1 ;;
  esac
done
echo "boot-test: PASS (screenshot: $out/screen.png)"
