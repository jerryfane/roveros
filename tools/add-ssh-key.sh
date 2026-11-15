#!/bin/bash
# Lets a public key log in as the rover user on a RoverOS image, before it is
# flashed: writes /home/rover/.ssh/authorized_keys on the image's data
# partition. Until first-boot setup exists, this is how a Rover gets its first
# key. Run it again to replace the key; it does not open the firewall (SSH is
# reachable over Tailscale and the USB cable only).
#
# Usage: tools/add-ssh-key.sh IMAGE KEY.pub TARGET   (TARGET: vm or sweet)
# Needs Docker. Changes IMAGE in place.
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
img=$(realpath "${1:?usage: tools/add-ssh-key.sh IMAGE KEY.pub TARGET}")
key=$(realpath "${2:?usage: tools/add-ssh-key.sh IMAGE KEY.pub TARGET}")
target=${3:?usage: tools/add-ssh-key.sh IMAGE KEY.pub TARGET}
[ -f "$repo/image/targets/$target.sh" ] || { echo "add-ssh-key: unknown target $target" >&2; exit 1; }
grep -qE '^(ssh-|ecdsa-|sk-)' "$key" || { echo "add-ssh-key: $key is not an OpenSSH public key" >&2; exit 1; }

docker run --rm -v "$repo/image:/image:ro" -v "$img:/rover.img" -v "$key:/key.pub:ro" \
  -e TARGET="$target" debian:trixie bash -c '
set -euo pipefail
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends python3-minimal e2fsprogs >/dev/null
. /image/targets/$TARGET.sh
fail() { echo "add-ssh-key: $*" >&2; exit 1; }
part() { # NAME -> "offset size" in bytes
  python3 - /rover.img "$TARGET_SECTOR_SIZE" "$1" <<"EOF"
import struct, sys
path, sector, want = sys.argv[1], int(sys.argv[2]), sys.argv[3]
f = open(path, "rb"); f.seek(sector); h = f.read(92)
assert h[:8] == b"EFI PART", "no GPT at this sector size"
lba, n, size = struct.unpack("<QII", h[72:88]); f.seek(lba * sector)
for _ in range(n):
    e = f.read(size)
    if e[56:128].decode("utf-16-le").rstrip("\0") == want:
        first, last = struct.unpack("<QQ", e[32:48])
        print(first * sector, (last - first + 1) * sector); break
EOF
}
read -r roff rlen <<<"$(part rover-root)"; read -r doff dlen <<<"$(part rover-data)"
[ -n "${roff:-}" ] && [ -n "${doff:-}" ] || fail "rover-root or rover-data partition not found"
cd /tmp
dd if=/rover.img of=root.ext4 bs=1M iflag=skip_bytes,count_bytes skip="$roff" count="$rlen" status=none
dd if=/rover.img of=data.ext4 bs=1M iflag=skip_bytes,count_bytes skip="$doff" count="$dlen" status=none
ids=$(debugfs -R "cat /etc/passwd" root.ext4 2>/dev/null | awk -F: "\$1==\"rover\" {print \$3, \$4}")
read -r uid gid <<<"$ids"; [ -n "${uid:-}" ] || fail "no rover user in the image"
home=/state/home/rover
debugfs -R "stat $home" data.ext4 2>/dev/null | grep -q "^Inode:" || fail "data partition lacks $home"
grep -E "^(ssh-|ecdsa-|sk-)" /key.pub >authorized_keys
debugfs -w data.ext4 -f - >/dev/null 2>&1 <<EOF
mkdir $home/.ssh
rm $home/.ssh/authorized_keys
write authorized_keys $home/.ssh/authorized_keys
sif $home/.ssh mode 040700
sif $home/.ssh uid $uid
sif $home/.ssh gid $gid
sif $home/.ssh/authorized_keys mode 0100600
sif $home/.ssh/authorized_keys uid $uid
sif $home/.ssh/authorized_keys gid $gid
EOF
e2fsck -fn data.ext4 >/dev/null || fail "data partition does not check clean after writing"
debugfs -R "cat $home/.ssh/authorized_keys" data.ext4 2>/dev/null | cmp -s - authorized_keys || fail "key did not land"
dd if=data.ext4 of=/rover.img bs=1M oflag=seek_bytes seek="$doff" conv=notrunc status=none
echo "add-ssh-key: rover (uid $uid) can log in with: $(awk "{print \$1, \$3}" authorized_keys | paste -sd" ")"
'
