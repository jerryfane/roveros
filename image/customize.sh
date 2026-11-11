#!/bin/bash
# mmdebstrap customize hook: turns the installed Debian root ($1) into the
# RoverOS root, and writes the data partition's seed and the boot files to
# $ROVER_WORK. Runs as root of mmdebstrap's user namespace.
set -euo pipefail
root=$1
work=$ROVER_WORK
read -r -a state_paths <<<"$ROVER_STATE_PATHS"

# The repository's owner is not mapped in this namespace.
cp -a --no-preserve=ownership "$ROVER_IMAGE_DIR/overlay/." "$root/"

# HerdrUp Desktop. Its dependencies are in image/packages; dpkg checks them.
# The image has dpkg but no apt.
cp "$work/herdrup.deb" "$root/tmp/herdrup.deb"
chroot "$root" dpkg -i /tmp/herdrup.deb
rm -f "$root/tmp/herdrup.deb"

chroot "$root" useradd --create-home --shell /bin/bash \
  --groups video,render,input,bluetooth rover
# No password, and not locked: key-only SSH works, password login does not.
chroot "$root" usermod --password '*' rover

chroot "$root" systemctl enable \
  rover-kiosk.service rover-selfcheck.service rover-ssh-hostkeys.service \
  nftables.service tailscaled.service ssh.service \
  NetworkManager.service ModemManager.service bluetooth.service \
  systemd-timesyncd.service
chroot "$root" systemctl set-default graphical.target

# Writable things the read-only root must not hold.
ln -sf ../run/NetworkManager/resolv.conf "$root/etc/resolv.conf"
rm -f "$root"/etc/ssh/ssh_host_*
# The machine ID lives on the data partition; the initramfs binds it here.
: >"$root/etc/machine-id"
ln -sf /etc/machine-id "$root/var/lib/dbus/machine-id"
chroot "$root" update-initramfs -u -k all

if [ "${ROVER_DEV:-}" = 1 ]; then
  echo "DEVELOPMENT IMAGE: SSH open on every interface" >&2
  sed -i 's|^\(\s*\)# dev: ssh$|\1tcp dport 22 accept|' "$root/etc/nftables.conf"
  owner=$(chroot "$root" id -u rover):$(chroot "$root" id -g rover)
  install -d -m700 -o "${owner%:*}" -g "${owner#*:}" "$root/home/rover/.ssh"
  printf '%s\n' "${ROVER_DEV_SSH_KEY:?ROVER_DEV=1 needs ROVER_DEV_SSH_KEY}" \
    >"$root/home/rover/.ssh/authorized_keys"
  chown "$owner" "$root/home/rover/.ssh/authorized_keys"
  chmod 600 "$root/home/rover/.ssh/authorized_keys"
fi

# The data partition: its state directories start as copies of the root's,
# and are bind-mounted over them at boot.
install -d "$root/data"
data="$work/data"
rm -rf "$data"
install -d -m700 "$data/ssh"
install -d -m2755 "$root/var/log/journal"
for p in "${state_paths[@]}"; do
  mkdir -p "$root$p" "$(dirname "$data/state$p")"
  cp -a "$root$p" "$data/state$p"
  echo "/data/state$p $p none bind,x-systemd.requires-mounts-for=/data 0 0" >>"$root/etc/fstab"
done
tar -C "$data" --numeric-owner -cf "$work/data.tar" .
rm -rf "$data"

# Boot files for the VM. The phone build will use the phone's own kernel.
cp "$(ls "$root"/boot/vmlinuz-* | sort -V | tail -1)" "$work/vmlinuz"
cp "$(ls "$root"/boot/initrd.img-* | sort -V | tail -1)" "$work/initrd.img"
