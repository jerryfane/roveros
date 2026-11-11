#!/bin/bash
# Builds the RoverOS VM image: a GPT disk with a read-only root partition and a
# data partition, plus the kernel, initrd and kernel command line for booting
# it directly.
#
# Runs as root inside a Debian trixie container (tools/build.sh starts it).
# On a non-arm64 host, arm64 programs run through qemu-user, registered in a
# binfmt_misc instance private to this build (Linux 6.7 or later), so the host
# is not changed.
#
# Usage: image/build.sh OUTDIR
# Environment: ROVER_DEV=1 builds a development image that accepts SSH on every
# interface for the key in ROVER_DEV_SSH_KEY. Never ship a development image.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=image/config.sh
. "$here/config.sh"

# Second stage: inside the build's own user namespace, as root of it.
if [ "${1:-}" = --rootfs ]; then
  work=$2
  if [ "$(uname -m)" != aarch64 ]; then
    mount -t binfmt_misc binfmt_misc /proc/sys/fs/binfmt_misc
    entry=$(grep -v '^#' /usr/lib/binfmt.d/qemu-aarch64.conf)
    case "${entry##*:}" in *F*) ;; *) entry="${entry}F" ;; esac
    printf '%s' "$entry" >/proc/sys/fs/binfmt_misc/register
  fi
  packages=$(grep -v '^\s*#' "$here/packages" | awk 'NF {print $1}' | paste -sd,)
  export ROVER_IMAGE_DIR=$here ROVER_WORK=$work ROVER_STATE_PATHS="${STATE_PATHS[*]}"
  exec setpriv --reuid=builder --regid=builder --init-groups \
    mmdebstrap --mode=unshare --variant=essential --arch=arm64 \
      --include="$packages" \
      --setup-hook='mkdir -p "$1/usr/share/keyrings" && cp /usr/share/keyrings/tailscale-archive-keyring.gpg "$1/usr/share/keyrings/"' \
      --customize-hook="$here/customize.sh" \
      "$DEBIAN_SUITE" "$work/root.tar" \
      "deb $DEBIAN_MIRROR $DEBIAN_SUITE main" \
      "$TAILSCALE_SOURCE"
fi

out=$(realpath -m "${1:?usage: image/build.sh OUTDIR}")
mkdir -p "$out"
work="$out/.work"
rm -rf "$work"
mkdir -p "$work"

export DEBIAN_FRONTEND=noninteractive
tools=(mmdebstrap uidmap e2fsprogs libarchive13t64 fdisk curl ca-certificates zstd arch-test)
[ "$(uname -m)" = aarch64 ] || tools+=(qemu-user-static)
apt-get update -qq
apt-get install -y -qq --no-install-recommends "${tools[@]}" >/dev/null

fetch() { # URL SHA256 DEST
  curl -fsSL -o "$3" "$1"
  echo "$2  $3" | sha256sum -c --quiet
}
fetch "$HERDRUP_URL" "$HERDRUP_SHA256" "$work/herdrup.deb"
fetch "$TAILSCALE_KEY_URL" "$TAILSCALE_KEY_SHA256" "$work/tailscale-archive-keyring.gpg"
# apt reads the signed-by path outside the new root too.
install -D -m644 "$work/tailscale-archive-keyring.gpg" /usr/share/keyrings/tailscale-archive-keyring.gpg

# mmdebstrap runs unprivileged in its own user namespace, mapped to these ids.
id builder >/dev/null 2>&1 || useradd -m builder
echo builder:100000:65536 >/etc/subuid
echo builder:100000:65536 >/etc/subgid
# mmdebstrap's hooks run as root of its namespace, which is uid 100000 here.
chown builder: "$work"
chmod 1777 "$work"
chmod 644 "$work/herdrup.deb"

unshare --user --map-users=0:0:1000000 --map-groups=0:0:1000000 \
  --mount --propagation private -- "$0" --rootfs "$work"

# Filesystems straight from the tarballs, then one GPT disk.
mib() { echo $(( ($(stat -c %s "$1") + 1048575) / 1048576 )); }
root_mb=$(( $(mib "$work/root.tar") * 5 / 4 + 256 ))
mkfs.ext4 -q -L rover-root -d "$work/root.tar" "$work/root.ext4" "${root_mb}M"
mkfs.ext4 -q -L rover-data -d "$work/data.tar" "$work/data.ext4" "${DATA_SIZE_MB}M"

img="$out/rover.img"
rm -f "$img"
truncate -s $(( 1 + root_mb + DATA_SIZE_MB + 1 ))M "$img"
sfdisk --quiet "$img" <<EOF
label: gpt
start=2048, size=$(( root_mb * 2048 )), type=B921B045-1DF0-41C3-AF44-4C6F280D3FAE, name=rover-root
size=$(( DATA_SIZE_MB * 2048 )), type=0FC63DAF-8483-4772-8E79-3D69D8477DE4, name=rover-data
EOF
dd if="$work/root.ext4" of="$img" bs=1M seek=1 conv=notrunc,sparse status=none
dd if="$work/data.ext4" of="$img" bs=1M seek=$(( 1 + root_mb )) conv=notrunc,sparse status=none

cp "$work/vmlinuz" "$work/initrd.img" "$out/"
echo "root=LABEL=rover-root ro console=ttyAMA0" >"$out/cmdline.txt"
(cd "$out" && sha256sum rover.img vmlinuz initrd.img cmdline.txt >SHA256SUMS)
rm -rf "$work"
echo "RoverOS image: $img (root ${root_mb} MiB, data ${DATA_SIZE_MB} MiB)"
