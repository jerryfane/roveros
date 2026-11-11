#!/bin/bash
# Checks a phone image's structure without the phone: the partition table at
# the target's sector size, the EFI partition's boot files, and that the root
# and the initramfs hold the target's kernel, modules and early firmware.
# It cannot tell whether the phone boots.
#
# Usage: tools/check-phone-image.sh OUTDIR TARGET    (e.g. out-sweet sweet)
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
out=$(realpath "${1:?usage: tools/check-phone-image.sh OUTDIR TARGET}")
target=${2:?usage: tools/check-phone-image.sh OUTDIR TARGET}

docker run --rm -v "$repo/image:/image:ro" -v "$out:/out:ro" -e TARGET="$target" \
  debian:trixie bash -c '
set -euo pipefail
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
  python3-minimal mtools e2fsprogs initramfs-tools-core zstd cpio >/dev/null
. /image/targets/$TARGET.sh
fail() { echo "check: FAIL: $*" >&2; exit 1; }
cd /tmp
(cd /out && sha256sum -c --quiet SHA256SUMS) || fail "SHA256SUMS"

# Partition table: name start_bytes size_bytes, read at the target sector size.
python3 - /out/rover.img "$TARGET_SECTOR_SIZE" >parts <<"EOF"
import struct, sys
path, sector = sys.argv[1], int(sys.argv[2])
f = open(path, "rb")
f.seek(sector)
h = f.read(92)
assert h[:8] == b"EFI PART", "no GPT header at this sector size"
lba, n, size = struct.unpack("<QII", h[72:88])
f.seek(lba * sector)
for _ in range(n):
    e = f.read(size)
    if e[:16] == bytes(16):
        continue
    first, last = struct.unpack("<QQ", e[32:48])
    name = e[56:128].decode("utf-16-le").rstrip("\0")
    print(name, first * sector, (last - first + 1) * sector)
EOF
cat parts
part() { awk -v n="$1" "\$1==n {print \$2, \$3}" parts; }
extract() { read -r off len <<<"$(part "$1")"; [ -n "${off:-}" ] || fail "no $1 partition"
  dd if=/out/rover.img of="$2" bs=1M iflag=skip_bytes,count_bytes skip="$off" count="$len" status=none; }
extract rover-boot boot.fat
extract rover-root root.ext4
part rover-data | grep -q . || fail "no rover-data partition"

export MTOOLS_SKIP_CHECK=1
for f in EFI/BOOT/BOOTAA64.EFI loader/loader.conf loader/entries/rover.conf vmlinuz initrd.img "dtbs/$TARGET_DTB"; do
  mdir -i boot.fat "::/$f" >/dev/null 2>&1 || fail "EFI partition lacks $f"
done
mtype -i boot.fat ::/loader/entries/rover.conf
mcopy -i boot.fat ::/initrd.img initrd.img

kver=$(debugfs -R "ls -p /usr/lib/modules" root.ext4 2>/dev/null | awk -F/ "\$6 !~ /^\\.\\.?\$/ && \$6 != \"\" {print \$6}")
[ "$(echo "$kver" | wc -l)" = 1 ] && [ -n "$kver" ] || fail "expected one kernel in /usr/lib/modules, got: $kver"
echo "kernel: $kver"
for f in /opt/herdrup/herdrup /usr/lib/modules/$kver/modules.dep /etc/rover/kiosk.env; do
  debugfs -R "stat $f" root.ext4 2>/dev/null | grep -q "^Inode:" || fail "root lacks $f"
done
# Every systemd unit a udev rule asks for must exist (name@.service for
# templates).
debugfs -R "rdump /usr/lib/udev/rules.d /tmp" root.ext4 2>/dev/null
for want in $(grep -ohE "SYSTEMD_WANTS\}=\"[^\"]+\"" /tmp/rules.d/*.rules | cut -d\" -f2 | tr " " "\n" | sort -u); do
  unit=$want
  case "$want" in *@*.service) unit="${want%%@*}@.service" ;; esac
  debugfs -R "stat /usr/lib/systemd/system/$unit" root.ext4 2>/dev/null | grep -q "^Inode:" ||
    fail "udev wants $want but the root lacks $unit"
  echo "udev unit: $want"
done
debugfs -R "cat /etc/rover/kiosk.env" root.ext4 2>/dev/null | grep -qx "ROVER_SCALE=$TARGET_SCALE" || fail "kiosk.env ROVER_SCALE"

mkdir ird && unmkinitramfs initrd.img ird
ls ird/main >/dev/null 2>&1 && ird=ird/main || ird=ird
[ -d "$ird/usr/lib/modules/$kver" ] || [ -d "$ird/lib/modules/$kver" ] || fail "initramfs lacks modules for $kver"
[ -x "$ird/scripts/init-bottom/rover-data" ] || fail "initramfs lacks rover-data"
for list in $(debugfs -R "ls -p /usr/share/rover/initramfs-files" root.ext4 2>/dev/null | awk -F/ "\$6 ~ /\\.files\$/ {print \$6}"); do
  debugfs -R "cat /usr/share/rover/initramfs-files/$list" root.ext4 2>/dev/null | while read -r line; do
    [ -n "$line" ] || continue
    f=${line#*:}
    [ -e "$ird$f" ] || [ -e "$ird${f#/usr}" ] || fail "initramfs lacks $f"
    echo "early firmware: $f"
  done
done
echo "check: PASS ($TARGET)"
'
