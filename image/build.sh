#!/bin/bash
# Builds a RoverOS disk image for one target: a GPT disk with an EFI partition
# (phone targets), a read-only root partition and a data partition.
#
# Runs as root inside a Debian trixie container (tools/build.sh starts it).
# On a non-arm64 host, arm64 programs run through qemu-user, registered in a
# binfmt_misc instance private to this build (Linux 6.7 or later), so the host
# is not changed.
#
# Usage: image/build.sh OUTDIR
# Environment:
#   ROVER_TARGET  a file name in image/targets/ without .sh (default: vm)
#   ROVER_DEV=1   builds a development image that accepts SSH on every
#                 interface for the key in ROVER_DEV_SSH_KEY. Never ship one.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
target=${ROVER_TARGET:-vm}
[ -f "$here/targets/$target.sh" ] || { echo "build.sh: unknown target $target" >&2; exit 1; }
# shellcheck source=image/config.sh
. "$here/config.sh"
# shellcheck source=image/targets/vm.sh
. "$here/targets/$target.sh"

# Second stage: inside the build's own user namespace, as root of it.
if [ "${1:-}" = --rootfs ]; then
  work=$2
  if [ "$(uname -m)" != aarch64 ]; then
    mount -t binfmt_misc binfmt_misc /proc/sys/fs/binfmt_misc
    entry=$(grep -v '^#' /usr/lib/binfmt.d/qemu-aarch64.conf)
    case "${entry##*:}" in *F*) ;; *) entry="${entry}F" ;; esac
    printf '%s' "$entry" >/proc/sys/fs/binfmt_misc/register
  fi
  packages=$( (grep -v '^\s*#' "$here/packages" | awk 'NF {print $1}'; printf '%s\n' "${TARGET_PACKAGES[@]}") | paste -sd,)
  export ROVER_IMAGE_DIR=$here ROVER_WORK=$work ROVER_STATE_PATHS="${STATE_PATHS[*]}" \
    ROVER_TARGET=$target ROVER_GDK_SCALE=$TARGET_GDK_SCALE ROVER_CMDLINE=$TARGET_CMDLINE \
    ROVER_DTB=${TARGET_DTB:-}
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
mkdir -p "$work/apks"

# mkfs.ext4 -d reads the tarballs through libarchive, which needs UTF-8 to
# read some file names.
export DEBIAN_FRONTEND=noninteractive LC_ALL=C.UTF-8
tools=(mmdebstrap uidmap e2fsprogs libarchive13t64 curl ca-certificates zstd
  arch-test python3-minimal dosfstools mtools)
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
i=0
for spec in "${TARGET_APKS[@]}"; do
  read -r url sum <<<"$spec"
  i=$((i + 1))
  fetch "$url" "$sum" "$(printf '%s/apks/%02d-%s' "$work" $i "${url##*/}")"
done

# mmdebstrap runs unprivileged in its own user namespace, mapped to these ids.
id builder >/dev/null 2>&1 || useradd -m builder
echo builder:100000:65536 >/etc/subuid
echo builder:100000:65536 >/etc/subgid
# mmdebstrap's hooks run as root of its namespace, which is uid 100000 here.
chown builder: "$work"
chmod 1777 "$work"
chmod -R a+rX "$work/herdrup.deb" "$work/apks"

unshare --user --map-users=0:0:1000000 --map-groups=0:0:1000000 \
  --mount --propagation private -- "$0" --rootfs "$work"

# Filesystems straight from the tarballs, then one GPT disk.
mib() { echo $(( ($(stat -c %s "$1") + 1048575) / 1048576 )); }
root_mb=$(( $(mib "$work/root.tar") * 5 / 4 + 256 ))
mkfs.ext4 -q -b 4096 -L rover-root -d "$work/root.tar" "$work/root.ext4" "${root_mb}M"
mkfs.ext4 -q -b 4096 -L rover-data -d "$work/data.tar" "$work/data.ext4" "${DATA_SIZE_MB}M"

esp_mb=$TARGET_ESP_SIZE_MB
if [ "$esp_mb" -gt 0 ]; then
  # EFI partition: systemd-boot, the kernel, the initramfs and the device tree.
  export MTOOLS_SKIP_CHECK=1
  truncate -s "${esp_mb}M" "$work/esp.fat"
  mkfs.vfat -q -F 32 -S "$TARGET_SECTOR_SIZE" -n ROVERBOOT "$work/esp.fat"
  mcopy -s -i "$work/esp.fat" "$work/boot/"* ::/
fi

img="$out/rover.img"
rm -f "$img"
# 1 MiB at each end for the partition table.
truncate -s $(( 1 + esp_mb + root_mb + DATA_SIZE_MB + 1 ))M "$img"
parts=()
start=1
if [ "$esp_mb" -gt 0 ]; then
  parts+=("rover-boot:C12A7328-F81F-11D2-BA4B-00A0C93EC93B:$start:$esp_mb")
  start=$((start + esp_mb))
fi
parts+=("rover-root:B921B045-1DF0-41C3-AF44-4C6F280D3FAE:$start:$root_mb")
parts+=("rover-data:0FC63DAF-8483-4772-8E79-3D69D8477DE4:$((start + root_mb)):$DATA_SIZE_MB")
python3 "$here/gpt.py" "$img" "$TARGET_SECTOR_SIZE" "${parts[@]}"
[ "$esp_mb" -gt 0 ] && dd if="$work/esp.fat" of="$img" bs=1M seek=1 conv=notrunc,sparse status=none
dd if="$work/root.ext4" of="$img" bs=1M seek=$start conv=notrunc,sparse status=none
dd if="$work/data.ext4" of="$img" bs=1M seek=$((start + root_mb)) conv=notrunc,sparse status=none

files=(rover.img)
if [ "$esp_mb" -gt 0 ]; then
  fetch "$TARGET_UBOOT_URL" "$TARGET_UBOOT_SHA256" "$out/u-boot.img"
  files+=(u-boot.img)
else
  # qemu boots the kernel directly (tools/run-vm.sh).
  cp "$work/boot/vmlinuz" "$work/boot/initrd.img" "$out/"
  echo "$TARGET_CMDLINE" >"$out/cmdline.txt"
  files+=(vmlinuz initrd.img cmdline.txt)
fi
(cd "$out" && sha256sum "${files[@]}" >SHA256SUMS)
rm -rf "$work"
echo "RoverOS $target image: $img (boot ${esp_mb} MiB, root ${root_mb} MiB, data ${DATA_SIZE_MB} MiB, ${TARGET_SECTOR_SIZE}-byte sectors)"
